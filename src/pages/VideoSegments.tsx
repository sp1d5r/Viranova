import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";
import ScrollableLayout from "../layouts/ScrollableLayout";
import { VideoPlayer } from "../components/video-player/VideoPlayer";
import { RecommendedShortIdeas } from "../components/video-handler/RecommendedShortIdea";
import { Timeline } from "../components/timeline/Timeline";
import { SegmentCard } from "../components/cards/segment-card/SegmentCard";
import { useVideoData } from "../contexts/VideoProvider";
import { Segment } from "../types/collections/Segment";

export interface VideoSegmentsProps {
  videoId?: string;
}

export const VideoSegments: React.FC<VideoSegmentsProps> = ({ videoId: propsVideoId }) => {
  const [searchParams] = useSearchParams();
  const paramVideoId = searchParams.get("video_id");
  const videoId = paramVideoId || propsVideoId || null;
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [seekTo, setSeekTo] = useState<number | undefined>(undefined);
  const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { video, segments } = useVideoData(videoId);

  const handleSeek = useCallback((time: number) => {
    if (seekTimeoutRef.current) {
      clearTimeout(seekTimeoutRef.current);
    }
    setSeekTo(time);
    seekTimeoutRef.current = setTimeout(() => {
      setSeekTo(undefined);
    }, 100); // Reset seekTo after 100ms
  }, []);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  useEffect(() => {
    return () => {
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
      }
    };
  }, []);

  const currentSegment = useMemo(() =>
      segments.find(seg => seg.earliestStartTime <= currentTime && currentTime <= seg.latestEndTime),
    [segments, currentTime]
  );

  const VideoContent = useMemo(() => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 flex-wrap md:flex-nowrap">
        {video?.videoPath && (
          <VideoPlayer
            className="flex-1 md:h-[50vh] min-w-[250px]"
            path={video.videoPath}
            loadingText="Loading Video..."
            setCurrentTime={handleTimeUpdate}
            seekTo={seekTo}
          />
        )}
        <RecommendedShortIdeas segments={segments} currentTime={currentTime} onSeek={handleSeek} />
      </div>

      <Timeline segments={segments} currentTime={currentTime} onSeek={handleSeek} />

      {currentSegment && (
        <SegmentCard
          key={currentSegment.id}
          currentSegment={currentSegment}
          segmentId={currentSegment.id}
          currentTime={currentTime}
        />
      )}
    </div>
  ), [video, segments, currentTime, currentSegment, handleTimeUpdate, handleSeek, seekTo]);

  return paramVideoId ? (
    <ScrollableLayout>
      <div className="flex flex-col gap container">
        <h1 className="text-title text-white">Video Segments</h1>
        {VideoContent}
      </div>
    </ScrollableLayout>
  ) : VideoContent;
};