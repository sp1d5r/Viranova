import React, { useEffect, useRef, useState, useCallback } from "react";
import { FirebaseStorageService } from "../../services/storage/strategies";
import { LoadingIcon } from "../loading/Loading";

export interface VideoPlayerProps {
  className?: string;
  path: string;
  loadingText?: string;
  setCurrentTime?: (time: number) => void;
  seekTo?: number;
  controls?: boolean;
  autoPlay?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
                                                          className = 'w-full flex-1 py-2',
                                                          path,
                                                          loadingText = "Loading Video ...",
                                                          setCurrentTime,
                                                          seekTo,
                                                          controls = true,
                                                          autoPlay = false
                                                        }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [source, setSource] = useState<string | undefined>(undefined);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevPathRef = useRef<string>("");

  const fetchVideoUrl = useCallback(async (videoPath: string) => {
    if (videoPath === prevPathRef.current) return;

    try {
      setLoading(true);
      const url = await FirebaseStorageService.getDownloadURL(videoPath);
      setSource(url);
      setError(undefined);
      prevPathRef.current = videoPath;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while loading the video.");
      setSource(undefined);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (path) {
      fetchVideoUrl(path);
    } else {
      setError("Path is empty...");
      setLoading(false);
    }
  }, [path, fetchVideoUrl]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && setCurrentTime) {
      const currentTime = videoRef.current.currentTime;
      setCurrentTime(currentTime);
    }
  }, [setCurrentTime]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && source) {
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      return () => {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [handleTimeUpdate, source]);

  useEffect(() => {
    if (videoRef.current && seekTo !== undefined) {
      videoRef.current.currentTime = seekTo;
    }
  }, [seekTo]);

  if (loading) {
    return (
      <div className={`${className} flex justify-center items-center`}>
        <LoadingIcon id={"video-player-loader"} text={loadingText} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400`} role="alert">
        <span className="font-medium">Error:</span> {error}
      </div>
    );
  }

  return (
    <div className={className}>
      {source && (
        <video className="w-full h-full aspect-video" controls={controls} autoPlay={autoPlay} ref={videoRef}>
          <source src={source} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};