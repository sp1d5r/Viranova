import React, {useRef, useEffect, useState} from 'react';
import { TrackItem } from '../../../../types/collections/Shorts';
import {FirebaseStorageService} from "../../../../services/storage/strategies";

interface BRollItemProps {
  item: TrackItem;
  currentTime: number;
}

const BRollItem: React.FC<BRollItemProps> = ({ item, currentTime }) => {
  const { objectMetadata } = item;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState(objectMetadata.src);

  useEffect(() => {
    if (objectMetadata.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = objectMetadata.offset + (currentTime - item.start) / 30; // Assuming 30 fps
    }
  }, [currentTime, item.start, objectMetadata]);

  const loadVideo = async (url: string) => {
    try {
      const res = await FirebaseStorageService.downloadFile(url);
      return URL.createObjectURL(res);
    } catch (err) {
      console.error(`Failed to load video: ${url}`, err);
      return undefined;
    }
  };

  useEffect(() => {
    if (objectMetadata.uploadType === 'upload') {
      loadVideo(objectMetadata.src).then((newSource) => {
        if (newSource) setSrc(newSource);
      })
    }
  }, [objectMetadata]);

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
        className="z-50 border-red-500 border border-primary bg-primary/20"
        muted
      />
    );
  }

  return null;
};

export default BRollItem;