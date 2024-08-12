import React, { useRef, useEffect } from 'react';
import { Segment } from '../../types/collections/Segment';
import FirebaseDatabaseService from "../../services/database/strategies/FirebaseFirestoreService";
import { useNotification } from "../../contexts/NotificationProvider";
import { useAuth } from "../../contexts/Authentication";
import { ReviewLangchainLogs } from "../review-langchain-run/ReviewLangchainLog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import {Sparkles} from "lucide-react";

interface RecommendedShortIdeasProps {
  segments: Segment[];
  currentTime: number;
  onSeek: (time: number) => void;
}

export const RecommendedShortIdeas: React.FC<RecommendedShortIdeasProps> = ({ segments, currentTime, onSeek }) => {
  const { showNotification } = useNotification();
  const { authState } = useAuth();
  const currentCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentCardRef.current) {
      currentCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentTime]);

  const handleGenerateShort = (segment: Segment) => {
    FirebaseDatabaseService.addDocument(
      "shorts",
      {
        "segment_id": segment.id,
        "logs": [],
        "transcript": segment.transcript,
        "short_idea": segment.shortIdea,
        "short_idea_explanation": segment.shortIdeaExplanation,
        "short_idea_run_id": segment.shortRunId,
        "video_id": segment.videoId,
        "start_index": segment.startIndex,
        "end_index": segment.endIndex,
        "error_count": 5,
        "previous_short_status": "Request AI Extraction",
        "short_status": "Edit Transcript",
        "pending_operation": false,
        "uid": authState.user?.uid,
      },
      (shortId) => {
        FirebaseDatabaseService.updateDocument(
          "topical_segments",
          segment.id,
          {
            segment_status: 'Crop Segment'
          },
          () => {
            showNotification("Short Generation", "Short generation started", "success");
            window.location.href = `/shorts?short_id=${shortId}`;
          },
          (error) => {
            showNotification("Cropping Segment", `${error}`, "error");
          }
        );
      },
      (error) => {
        showNotification("Document Creation", `${error}`, "error");
      }
    );
  };

  const filteredAndSortedSegments = segments
    .filter(segment => {
      const wordCount = segment.transcript.split(" ").length;
      return wordCount >= 100 && wordCount <= 300;
    })
    .sort((a, b) => {
      const aCurrent = a.earliestStartTime <= currentTime && currentTime <= a.latestEndTime;
      const bCurrent = b.earliestStartTime <= currentTime && currentTime <= b.latestEndTime;
      if (aCurrent && !bCurrent) return -1;
      if (!aCurrent && bCurrent) return 1;
      return a.earliestStartTime - b.earliestStartTime;
    });

  return (
    <div className="flex-1">
      <CardHeader>
        <CardTitle className="text-white text-2xl font-bold flex gap-2 items-center">
          <Sparkles className="text-primary" />
          AI-Powered Short Ideas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[50vh] pr-4">
          {filteredAndSortedSegments.map((segment, index) => (
            <div
              key={segment.id}
              ref={segment.earliestStartTime <= currentTime && currentTime <= segment.latestEndTime ? currentCardRef : null}
              className={`mb-6 neon-card ${segment.earliestStartTime <= currentTime && currentTime <= segment.latestEndTime ? 'ring-2 ring-blue-500' : ''}`}
            >
              <CardHeader className="glass-effect rounded-none">
                <CardTitle className="text-xl text-white">{segment.segmentTitle}</CardTitle>
                <p className="text-sm text-blue-300">
                  {segment.earliestStartTime.toFixed(2)}s - {segment.latestEndTime.toFixed(2)}s
                </p>
              </CardHeader>
              <CardContent className="mt-4">
                {segment.shortIdea ? (
                  <>
                    <p className="mb-3 text-white">
                      <span className="font-bold text-green-300">Idea: </span>
                      {segment.shortIdea}
                    </p>
                    <p className="mb-4 text-white">
                      <span className="font-bold text-purple-300">Justification: </span>
                      {segment.shortIdeaExplanation}
                    </p>
                    <div className="flex gap-3 mb-4">
                      <Button
                        onClick={() => handleGenerateShort(segment)}
                        className="!bg-primary !text-purple-900 font-bold"
                      >
                        Generate Short
                      </Button>
                      <Button
                        onClick={() => onSeek(segment.earliestStartTime)}
                        className="bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-bold"
                      >
                        Jump to Segment
                      </Button>
                    </div>
                    <div className="glass-effect p-3">
                      <ReviewLangchainLogs runId={segment.shortRunId} />
                    </div>
                  </>
                ) : (
                  <p className="text-yellow-300">No short idea generated for this segment.</p>
                )}
              </CardContent>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </div>
  );
};