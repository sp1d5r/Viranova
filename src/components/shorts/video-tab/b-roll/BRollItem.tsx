import React, { useRef, useEffect } from 'react';
import { TrackItem } from './types';

interface BRollItemProps {
  item: TrackItem;
  currentTime: number;
}

const BRollItem: React.FC<BRollItemProps> = ({ item, currentTime }) => {
  const { objectMetadata } = item;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (objectMetadata.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = objectMetadata.offset + (currentTime - item.start) / 30; // Assuming 30 fps
    }
  }, [currentTime, item.start, objectMetadata]);

  const style = {
    position: 'absolute' as const,
    left: `${objectMetadata.x * 270 / 1080}px`,
    top: `${objectMetadata.y * 480 / 1920}px`,
    width: `${objectMetadata.width * 270 / 1080}px`,
    height: `${objectMetadata.height * 480 / 1920}px`,
  };

  if (objectMetadata.type === 'image') {
    return (
      <img
        src={objectMetadata.src}
        style={style}
        alt="B-Roll item"
        className="z-50 border border-primary bg-primary/20"
      />
    );
  } else if (objectMetadata.type === 'video') {
    return (
      <video
        ref={videoRef}
        src={objectMetadata.src}
        style={style}
        className="z-50 border-red-500"
        muted
      />
    );
  }

  return null;
};

export default BRollItem;