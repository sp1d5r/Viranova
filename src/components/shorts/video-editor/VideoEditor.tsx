import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BoundingBoxes, Short } from '../../../types/collections/Shorts';
import { FirebaseStorageService } from '../../../services/storage/strategies';
import { LoadingIcon } from '../../loading/Loading';
import FirebaseFirestoreService from "../../../services/database/strategies/FirebaseFirestoreService";
import {useNotification} from "../../../contexts/NotificationProvider";

export interface VideoEditorProps {
  short: Short;
  shortId: string;
  showBoundingBoxes?: boolean;
  currentFrame: number;
  setCurrentFrame: React.Dispatch<React.SetStateAction<number>>
}

type VideoInfo = {
  clippedVideo: undefined | string;
}

export const VideoEditor: React.FC<VideoEditorProps> = ({ short, shortId,currentFrame, setCurrentFrame, showBoundingBoxes = true }) => {
  const [loading, setLoading] = useState(true);
  const fps = short.fps;
  const [pause, setPause] = useState(false);
  const [videoUrls, setVideoUrls] = useState<VideoInfo>({clippedVideo: undefined});
  const [internalBoundingBoxes, setInternalBoundingBoxes] = useState<BoundingBoxes | undefined>(short.bounding_boxes);
  const clippedVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const {showNotification} = useNotification();

  useEffect(() => {
    const video = clippedVideoRef.current;

    const handleTimeUpdate = () => {
      if (video) {
        const frameRate = fps;
        const frame = Math.floor(video.currentTime * frameRate);
        setCurrentFrame(frame);
        if (audioRef.current) {
          audioRef.current.currentTime = video.currentTime;
        }
      }
    };

    video && video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video && video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [clippedVideoRef.current, internalBoundingBoxes]);

  useEffect(() => {
    if (short && short.short_clipped_video) {
      setLoading(true);
      FirebaseStorageService.downloadFile(short.short_clipped_video).then((res) => {
        const url = URL.createObjectURL(res);
        setVideoUrls((prevState) => ({...prevState, clippedVideo: url}));
        setLoading(false);
      }).catch((err) => {
        setVideoUrls((prevState) => ({...prevState, clippedVideo: err}));
        setLoading(false);
      });
    }
  }, [short]);

  const clipPath = useMemo(() => {
    if (!internalBoundingBoxes) return "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

    const box = internalBoundingBoxes.boxes[currentFrame];
    const left = (box[0] / short.width) * 100;
    const top = (box[1] / short.height) * 100;
    const right = ((box[0] + box[2]) / short.width) * 100;
    const bottom = ((box[1] + box[3]) / short.height) * 100;

    return `polygon(
      0% 0%, 100% 0%, 100% 100%, 0% 100%,
      0% ${top}%,
      ${left}% ${top}%,
      ${left}% ${bottom}%,
      ${right}% ${bottom}%,
      ${right}% ${top}%,
      0% ${top}%
    )`;
  }, [currentFrame, internalBoundingBoxes, short.width, short.height]);

  const handlePlayPause = () => {
    const clipped = clippedVideoRef.current;
    const audio = audioRef.current;
    if (clipped) {
      if (clipped.paused) {
        const playPromise = clipped.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            audio && audio.play().catch(err => console.error("Failed to play audio:", err));
          }).catch(err => {
            console.error("Failed to play clipped video:", err);
          });
        }
        setPause(false);
      } else {
        setPause(true);
        clipped.pause();
        audio && audio.pause();
      }
    }
  };

  const handleFrameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const frameIndex = parseInt(e.target.value);
    setCurrentFrame(frameIndex);
    // Optionally, adjust video playback if needed
    if (clippedVideoRef.current) {
      const time = frameIndex / fps;
      clippedVideoRef.current.currentTime = time;
      if (audioRef.current) {
        audioRef.current.currentTime = time;
      }
    }
  };

  const SeekBar = ({currentFrame, totalFrames, cuts}: {
    currentFrame: number,
    totalFrames: number,
    cuts: number[]
  }) => {
    const intervals = [];
    let start = 0;

    // Define intervals based on cuts
    cuts.forEach((cut, index) => {
      intervals.push({start, end: cut});
      start = cut + 1;
    });

    // Add the last interval if necessary
    if (start <= totalFrames - 1) {
      intervals.push({start, end: totalFrames - 1});
    }

    return (
      <div className="seek-bar relative w-full h-12 rounded-lg overflow-hidden">
        <input
          type="range"
          min="0"
          max={totalFrames - 1}
          value={currentFrame}
          onChange={handleFrameChange}
          className="slider absolute w-full z-50 opacity-30"
        />

        {intervals.map((interval, index) => {
          const isWithinInterval = currentFrame >= interval.start && currentFrame <= interval.end;

          // Calculate width of the progress within the interval
          const progressWidth = currentFrame > interval.start
            ? Math.min(100, (currentFrame - interval.start) / (interval.end - interval.start + 1) * 100)
            : 0;

          return (
            <div
              key={index}
              className={`absolute h-full rounded-md border ${isWithinInterval ? 'border-blue-500 bg-emerald-950' : 'border-emerald-500 bg-gray-700'}`}
              style={{
                left: `${(interval.start / totalFrames) * 100}%`,
                width: `${((interval.end - interval.start + 1) / totalFrames) * 100}%`,
              }}
            >
              <div className="absolute w-full h-full rounded overflow-hidden">
                <div
                  className="h-full bg-emerald-700"
                  style={{
                    width: `${progressWidth}%`
                  }}
                />
              </div>
            </div>
          );
        })}

      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-2 items-center">
      {
        loading ?
          <div className="w-full h-full flex justify-center items-center py-16">
            <LoadingIcon id={"video-player-loader"} text={"Loading Videos..."}/>
          </div> :
          <div className="flex w-full flex-col gap-2 h-full overflow-hidden">
            <div className="relative video-overlay-container w-full mt-5 overflow-hidden">
              {
                videoUrls.clippedVideo &&
                <video ref={clippedVideoRef} id="videoElement" className="z-10 w-full" playsInline webkit-playsinline>
                  <source src={videoUrls.clippedVideo} type="video/mp4"/>
                </video>
              }
              {
                showBoundingBoxes && internalBoundingBoxes &&
                <div className="absolute top-0 left-0 w-full h-full bg-primary opacity-50"
                     style={{clipPath: clipPath}}/>
              }
              {
                showBoundingBoxes && internalBoundingBoxes && <div
                  className="absolute border-2 border-primary border-dashed"
                  style={{
                    width: `${(internalBoundingBoxes.boxes[currentFrame][2] / short.width) * 100}%`,
                    height: `${(internalBoundingBoxes.boxes[currentFrame][3] / short.height) * 100}%`,
                    top: `${(internalBoundingBoxes.boxes[currentFrame][1] / short.height) * 100}%`,
                    left: `${(internalBoundingBoxes.boxes[currentFrame][0] / short.width) * 100}%`,
                  }}/>
              }
            </div>
            {
              short.temp_audio_file && short.temp_audio_file !== "Loading..." &&
              <div className="font-bold text-white flex w-full justify-between">
                <p>Preview Audio</p>
                <audio ref={audioRef} src={short.temp_audio_file} controls/>
              </div>
            }
            <div className="flex flex-col gap-2 my-2">
              <div className="flex gap-2">
                <button onClick={handlePlayPause} type="button"
                        className="text-white border-white border font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 ">
                  {pause ?
                    <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true"
                         xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                         viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8l8-6a1 1 0 0 0 0-1.6l-8-6Z"
                            clipRule="evenodd"/>
                    </svg> :
                    <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true"
                         xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                         viewBox="0 0 24 24">
                      <path fillRule="evenodd"
                            d="M8 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1Z"
                            clipRule="evenodd"/>
                    </svg>
                  }
                  <span className="sr-only">Icon description</span>
                </button>
                {short.cuts &&
                  <SeekBar currentFrame={currentFrame} totalFrames={short.total_frame_count} cuts={short.cuts}/>}
              </div>
            </div>
          </div>
      }
    </div>
  );
}