import React, { useState, useCallback } from 'react';
import { PlusCircle } from "lucide-react";
import { Track, TrackItem } from './types';
import {Button} from "../../../ui/button";

interface TrackListProps {
  tracks: Track[];
  totalFrames: number;
  currentTime: number;
  onAddItem: (trackId: string, type: 'video' | 'image') => void;
  onItemSelect: (item: TrackItem) => void;
  onTracksUpdate: (tracks: Track[]) => void;
}

const TrackList: React.FC<TrackListProps> = ({ tracks, totalFrames, currentTime, onAddItem, onItemSelect, onTracksUpdate }) => {
  const [draggedItem, setDraggedItem] = useState<{ trackId: string; itemId: string; type: 'move' | 'resize' } | null>(null);
  const [startX, setStartX] = useState(0);

  const handleMouseDown = (e: React.MouseEvent, trackId: string, itemId: string, type: 'move' | 'resize') => {
    setDraggedItem({ trackId, itemId, type });
    setStartX(e.clientX);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedItem) return;

    const deltaX = e.clientX - startX;
    const updatedTracks = tracks.map(track => {
      if (track.id !== draggedItem.trackId) return track;
      return {
        ...track,
        items: track.items.map(item => {
          if (item.id !== draggedItem.itemId) return item;
          if (draggedItem.type === 'move') {
            const newStart = Math.max(0, Math.min(item.start + deltaX, totalFrames - (item.end - item.start)));
            return {
              ...item,
              start: newStart,
              end: newStart + (item.end - item.start)
            };
          } else {
            const newEnd = Math.max(item.start + 1, Math.min(item.end + deltaX, totalFrames));
            return { ...item, end: newEnd };
          }
        })
      };
    });

    onTracksUpdate(updatedTracks);
    setStartX(e.clientX);
  }, [draggedItem, startX, tracks, totalFrames, onTracksUpdate]);

  const handleMouseUp = useCallback(() => {
    setDraggedItem(null);
  }, []);

  React.useEffect(() => {
    if (draggedItem) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedItem, handleMouseMove, handleMouseUp]);

  const TrackerTag: React.FC<{currentFrame: number}> = ({currentFrame}) => {
    return <div className="absolute h-full top-0 w-1 bg-white" style={{left: `${currentFrame}px`}}/>;
  };

  return (
    <div className="tracks-container overflow-x-auto w-full">
      {tracks.map(track => (
        <div
          key={track.id}
          className="track p-1 bg-zinc-950 rounded-lg flex mb-2"
          style={{ width: `${totalFrames + 100}px` }}
        >
          <Button
            size="icon"
            variant="outline"
            onClick={() => onAddItem(track.id, 'image')}
            className="bg-gray-700 hover:bg-gray-500 text-white font-bold p-[2px] rounded h-10 w-10 flex justify-center items-center mr-2"
          >
            <PlusCircle size={20} />
          </Button>
          <div className="track-items relative h-10 bg-zinc-900 flex-grow border border-slate-200 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 no-scrollbar " style={{ width: `${totalFrames}px` }}>
            {track.items.map(item => (
              <div
                key={item.id}
                className="track-item absolute h-full bg-teal-900/30 text-white flex items-center justify-between cursor-move"
                style={{
                  left: `${item.start}px`,
                  width: `${item.end - item.start}px`,
                }}
                onMouseDown={(e) => handleMouseDown(e, track.id, item.id, 'move')}
                onClick={() => onItemSelect(item)}
              >
                <div className="px-2">{item.start}</div>
                <div
                  className="w-2 h-full bg-teal-950 cursor-e-resize absolute right-0 top-0"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDown(e, track.id, item.id, 'resize');
                  }}
                />
              </div>
            ))}
            <TrackerTag currentFrame={currentTime} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrackList;