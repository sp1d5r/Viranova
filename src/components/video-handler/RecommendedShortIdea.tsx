import React, { useRef, useEffect, useState } from 'react';
import { Segment } from '../../types/collections/Segment';
import FirebaseDatabaseService from "../../services/database/strategies/FirebaseFirestoreService";
import { useNotification } from "../../contexts/NotificationProvider";
import { useAuth } from "../../contexts/Authentication";
import { ReviewLangchainLogs } from "../review-langchain-run/ReviewLangchainLog";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Sparkles } from "lucide-react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "../ui/tooltip";
import ConfirmationModal from "./ConfirmationModal";
import {useShortRequestManagement} from "../../contexts/ShortRequestProvider";

interface RecommendedShortIdeasProps {
  segments: Segment[];
  currentTime: number;
  onSeek: (time: number) => void;
}

export const RecommendedShortIdeas: React.FC<RecommendedShortIdeasProps> = ({ segments, currentTime, onSeek }) => {
  const { showNotification } = useNotification();
  const { authState } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentSegment, setCurrentSegment] = useState<Segment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<Segment | undefined>(undefined);
  const { createShortRequest } = useShortRequestManagement();

  const filteredAndSortedSegments = segments
    .filter(segment => {
      const wordCount = segment.transcript.split(" ").length;
      return wordCount >= 100 && wordCount <= 300;
    })
    .sort((a, b) => a.earliestStartTime - b.earliestStartTime);

  useEffect(() => {
    const newCurrentSegment = filteredAndSortedSegments.find(
      segment => segment.earliestStartTime <= currentTime && currentTime <= segment.latestEndTime
    );
    setCurrentSegment(newCurrentSegment || null);
  }, [currentTime, filteredAndSortedSegments]);

  useEffect(() => {
    if (currentSegment && scrollContainerRef.current) {
      const segmentElement = document.getElementById(`segment-${currentSegment.id}`);

      if (segmentElement) {
        const containerTop = scrollContainerRef.current.offsetTop;
        const segmentTop = segmentElement.offsetTop;
        const offset = segmentTop - containerTop;

        scrollContainerRef.current.scrollTo({
          top: offset,
          behavior: 'smooth'
        });
      }
    }
  }, [currentSegment]);

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
            createShortRequest(
              shortId,
              "v1/temporal-segmentation",
              (requestId) => {
                showNotification("Short Request Created", `Request ID: ${requestId}`, "success");
                window.location.href = `/shorts?short_id=${shortId}`;
              },
              (error) => {
                showNotification("Short Request Creation Failed", `${error}`, "error");
              }
            );
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

  const handleAutoGenerate = (segment: Segment) => {
    setSelectedSegment(segment);
    setIsModalOpen(true);
  };

  const handleConfirmGeneration = () => {
    if (selectedSegment) {
      FirebaseDatabaseService.addDocument(
        "shorts",
        {
          "segment_id": selectedSegment.id,
          "logs": [],
          "transcript": selectedSegment.transcript,
          "short_idea": selectedSegment.shortIdea,
          "short_idea_explanation": selectedSegment.shortIdeaExplanation,
          "short_idea_run_id": selectedSegment.shortRunId,
          "video_id": selectedSegment.videoId,
          "start_index": selectedSegment.startIndex,
          "end_index": selectedSegment.endIndex,
          "error_count": 5,
          "previous_short_status": "Request AI Extraction",
          "short_status": "Edit Transcript",
          "pending_operation": false,
          "uid": authState.user?.uid,
          "auto_generate": true
        },
        (shortId) => {
          FirebaseDatabaseService.updateDocument(
            "topical_segments",
            selectedSegment.id,
            {
              segment_status: 'Crop Segment'
            },
            () => {
              showNotification("Short Generation", "Short generation started", "success");
              createShortRequest(
                shortId,
                "v1/temporal-segmentation",
                (requestId) => {
                  showNotification("Short Request Created", `Request ID: ${requestId}`, "success");
                  window.location.href = `/shorts?short_id=${shortId}`;
                },
                (error) => {
                  showNotification("Short Request Creation Failed", `${error}`, "error");
                }
              );
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
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1">
      <CardHeader>
        <CardTitle className="text-white text-2xl font-bold flex gap-2 items-center">
          <Sparkles className="text-primary" />
          AI-Powered Short Ideas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[50vh] pr-4" ref={scrollContainerRef}>
          {filteredAndSortedSegments.map((segment) => (
            <div
              key={segment.id}
              id={`segment-${segment.id}`}
              className={`mb-6 neon-card ${segment.id === currentSegment?.id ? 'ring-2 ring-accent border-primary ' : ''}`}
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
                        onClick={() => onSeek(segment.earliestStartTime + 1)}
                      >
                        Jump to Segment
                      </Button>
                      <TooltipProvider key={segment.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleAutoGenerate(segment)}
                              className="bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-bold"
                            >
                              <Sparkles />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm max-w-[200px]">
                              <p><strong>Automatically generate this short</strong></p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmGeneration}
        segment={selectedSegment}
      />
    </div>
  );
};