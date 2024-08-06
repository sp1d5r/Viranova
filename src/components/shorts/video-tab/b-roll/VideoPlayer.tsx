import React, { useRef, useEffect } from 'react';
import { Track } from './types';
import { Short } from "../../../../types/collections/Shorts";
import BRollItem from './BRollItem';

interface VideoPlayerProps {
  videoUrl: string | undefined;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  tracks: Track[];
  short: Short;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, currentTime, setCurrentTime, tracks, short }) => {
  const aRollRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleTimeUpdate = () => {
      if (aRollRef.current) {
        setCurrentTime(aRollRef.current.currentTime * (short.fps || 30));
      }
    };

    const videoElement = aRollRef.current;
    videoElement?.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      videoElement?.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [setCurrentTime, short.fps]);

  return (
    <div className="flex-1 flex justify-center items-center">
      <div className="relative w-[270px] h-[480px] bg-red-300 my-2 flex justify-center items-center overflow-hidden">
        {videoUrl ? (
          <video ref={aRollRef} className="z-10 h-full w-full" controls>
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <p>Video Will Play Here</p>
        )}
        {tracks.flatMap(track => track.items).map(item => {
          if (currentTime >= item.start && currentTime <= item.end) {
            return <BRollItem key={item.id} item={item} currentTime={currentTime} />;
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default VideoPlayer;