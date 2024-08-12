import React from 'react';

interface TimelineProps {
  segments: Array<{ id: string; earliestStartTime: number; latestEndTime: number; flagged: boolean }>;
  totalDuration: number;
  currentTime: number;
  onSeek: (time: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ segments, totalDuration, currentTime, onSeek }) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickedTime = (x / rect.width) * totalDuration;
    onSeek(clickedTime);
  };

  return (
    <div className="w-full h-8 bg-gray-700 relative cursor-pointer" onClick={handleClick}>
      {segments.map((segment) => (
        <div
          key={segment.id}
          className={`absolute h-full ${segment.flagged ? 'bg-red-500' : 'bg-blue-500'}`}
          style={{
            left: `${(segment.earliestStartTime / totalDuration) * 100}%`,
            width: `${((segment.latestEndTime - segment.earliestStartTime) / totalDuration) * 100}%`,
          }}
        />
      ))}
      <div
        className="absolute h-full w-1 bg-white"
        style={{ left: `${(currentTime / totalDuration) * 100}%` }}
      />
    </div>
  );
};