import React from 'react';
import { Segment } from '../../types/collections/Segment';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface TimelineProps {
  segments: Segment[];
  currentTime: number;
  onSeek: (time: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ segments, currentTime, onSeek }) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex gap-[2px]">
      {segments.map((segment, index) => (
        <TooltipProvider key={segment.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSeek(segment.earliestStartTime)}
                className={`h-5 rounded-md relative border 
                            ${segment.flagged ? 'border-red-500' : 'border-emerald-500'}
                            ${segment.latestEndTime <= currentTime ? 'bg-emerald-700' : ''}
                            ${segment.earliestStartTime <= currentTime && currentTime <= segment.latestEndTime ? 'bg-emerald-950' : ''}
                            ${segment.earliestStartTime >= currentTime ? 'bg-gray-700' : ''}`}
                style={{
                  width: `${100 * ((segment.latestEndTime - segment.earliestStartTime) / (segments[segments.length - 1].latestEndTime))}%`
                }}
              >
                <div className="absolute top-0 left-0 rounded-md w-full h-full overflow-hidden">
                  <div
                    className="absolute bg-emerald-700 h-[98%] left-0 top-0 translate-y-[1%] rounded-md overflow-hidden border-emerald-500"
                    style={{
                      width: segment.earliestStartTime <= currentTime && currentTime <= segment.latestEndTime
                        ? `${100 - 100 * ((segment.latestEndTime - currentTime) / (segment.latestEndTime - segment.earliestStartTime))}%`
                        : 0
                    }}
                  />
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm max-w-[200px]">
                <p><strong>{segment.segmentTitle}</strong></p>
                <p>{segment.segmentSummary}</p>
                <p>Start: {formatTime(segment.earliestStartTime)}</p>
                <p>End: {formatTime(segment.latestEndTime)}</p>
                <p>Duration: {formatTime(segment.latestEndTime - segment.earliestStartTime)}</p>
                {segment.flagged && <p className="text-red-500">Flagged</p>}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};