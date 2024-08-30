import React, { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from "react-router-dom";
import ScrollableLayout from "../layouts/ScrollableLayout";
import { VideoPlayer } from "../components/video-player/VideoPlayer";
import { RecommendedShortIdeas } from "../components/video-handler/RecommendedShortIdea";
import { Timeline } from "../components/timeline/Timeline";
import { SegmentCard } from "../components/cards/segment-card/SegmentCard";
import { useVideoData } from "../contexts/VideoProvider";

export interface VideoSegmentsProps {
    videoId?: string;
}

export const VideoSegments: React.FC<VideoSegmentsProps> = ({ videoId: propsVideoId }) => {
    const [searchParams] = useSearchParams();
    const paramVideoId = searchParams.get("video_id");
    const videoId = paramVideoId || propsVideoId || null;

    const [currentTime, setCurrentTime] = useState<number>(0);
    const [seekTo, setSeekTo] = useState<number | undefined>(undefined);

    const { video, segments } = useVideoData(videoId);

    const handleSeek = useCallback((time: number) => {
        setSeekTo(time);
    }, []);

    const handleTimeUpdate = useCallback((time: number) => {
        setCurrentTime(time);
    }, []);

    const currentSegment = useMemo(() =>
        segments.find(seg => seg.earliestStartTime <= currentTime && currentTime <= seg.latestEndTime),
      [segments, currentTime]
    );


    const VideoContent = (
      <div className="flex flex-col gap-4">
          <div className="flex gap-4 flex-wrap sm:flex-nowrap">
              {video?.videoPath && (
                <VideoPlayer
                  className="flex-1 sm:h-[50vh]"
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
    );

    return paramVideoId ? (
      <ScrollableLayout>
          <h1 className="text-title text-white">Video Segments</h1>
          {VideoContent}
      </ScrollableLayout>
    ) : VideoContent;
};