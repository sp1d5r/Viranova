import React, { useEffect, useRef, useState } from "react";
import { FirebaseStorageService } from "../../services/storage/strategies";
import { LoadingIcon } from "../loading/Loading";

export interface SegmentVideoProps {
  className?:string,
  path: string;
  loadingText?: string;
  setCurrentTime?: (time: number) => void;
  seekTo?: number;
}

export const VideoPlayer: React.FC<SegmentVideoProps> = ({ className = 'w-full flex-1 py-2', path, loadingText = "Loading Video ...", setCurrentTime,seekTo }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [source, setSource] = useState<string | undefined>(undefined);
  const videoRef = useRef<HTMLVideoElement>(null);  // Reference to the video element

  useEffect(() => {
    if (path) {
      setLoading(true);
      FirebaseStorageService.getDownloadURL(path).then((url) => {
        setSource(url);
        setLoading(false);
      }).catch((err) => {
        setError(err.toString());
        setLoading(false);
      });
    } else {
      setError("Path is empty...");
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    const videoElement = videoRef.current;

    const handleTimeUpdate = () => {
      if (videoElement && setCurrentTime) {
        setCurrentTime(videoElement.currentTime);
      }
    };

    if (videoElement) {
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [setCurrentTime]);

  useEffect(() => {
    if (videoRef.current && seekTo !== undefined) {
      videoRef.current.currentTime = seekTo;
    }
  }, [seekTo]);

  useEffect(() => {
    const videoElement = videoRef.current;

    const handleTimeUpdate = () => {
      if (videoElement && setCurrentTime) {
        setCurrentTime(videoElement.currentTime);
      }
    };

    if (videoElement) {
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [setCurrentTime]);

  return (
    <div className={className}>
      {loading ? (
        <div className="w-full h-full flex justify-center items-center py-16">
          <LoadingIcon id={"video-player-loader"} text={loadingText} />
        </div>
      ) : (
        <>
          {source ? (
            <video className="w-full h-full aspect-video" controls ref={videoRef}>
              <source src={source} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <p className="text-primary font-bold">Video not available.</p>
          )}
        </>
      )}

      {error && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}
    </div>
  );
}