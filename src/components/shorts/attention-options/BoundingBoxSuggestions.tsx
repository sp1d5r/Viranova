import React, {useEffect, useRef, useState} from "react";
import {Short} from "../../../types/collections/Shorts";
import {FirebaseStorageService} from "../../../services/storage/strategies";
import {LoadingIcon} from "../../loading/Loading";
import {AreaUnderChart} from "../../charts/AreaUnderChart";
import FirebaseFirestoreService from "../../../services/database/strategies/FirebaseFirestoreService";
import {useNotificaiton} from "../../../contexts/NotificationProvider";
import "./bounding-box.css";

export interface BoundingBoxSuggestionsProps{
  short: Short;
  shortId: string;
}

type VideoInfo = {
  clippedVideo: undefined | string;
  saliencyVideo: undefined | string;
}

export const BoundingBoxSuggestions: React.FC<BoundingBoxSuggestionsProps> = ({short, shortId}) => {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<VideoInfo>({clippedVideo: undefined, saliencyVideo: undefined});
  const fps = 25;
  const [pause, setPause] = useState(false);
  const {showNotification} = useNotificaiton();
  const [videoUrls, setVideoUrls] = useState<VideoInfo>({clippedVideo: undefined, saliencyVideo: undefined});
  const [opacity, setOpacity] = useState(0);

  const [currentFrame, setCurrentFrame] = useState(0);
  const totalFrames = short.total_frame_count;

  const clippedVideoRef = useRef<HTMLVideoElement>(null);
  const saliencyVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);


  function drawBoundingBoxes(ctx: CanvasRenderingContext2D, currentTime: number, video: HTMLVideoElement) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear previous drawings

    if (short.bounding_boxes && short.bounding_boxes['boxes']) {
      const boxes = short.bounding_boxes['boxes'];

      const frameNumber = Math.floor(currentTime * fps); // Example: videoFrameRate is frames per second
      const currentBoxes = boxes[frameNumber];

      if (currentBoxes) {
        const [x, y, width, height] = currentBoxes;

        // Get original video dimensions
        const originalWidth = video.videoWidth;
        const originalHeight = video.videoHeight;

        // Get canvas dimensions
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;

        // Calculate scaling factors
        const widthScale = canvasWidth / originalWidth;
        const heightScale = canvasHeight / originalHeight;

        // Scale bounding box coordinates
        const scaledX = x * widthScale;
        const scaledY = y * heightScale;
        const scaledWidth = width * widthScale;
        const scaledHeight = height * heightScale;

        // Draw scaled bounding box
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
      }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = clippedVideoRef.current;
    if (canvas && video) {
      const ctx = canvas.getContext('2d');
      video.addEventListener('play', () => {
        const render = () => {
          if (!video.paused && ctx && !video.ended) {
            drawBoundingBoxes(ctx, video.currentTime, video);
            setCurrentFrame(Math.floor(video.currentTime * fps));
            requestAnimationFrame(render);
          }
        };
        requestAnimationFrame(render);
      });
    }
  }, [canvasRef.current, clippedVideoRef.current, currentFrame]);

  useEffect(() => {
    const clipped = clippedVideoRef.current;
    const saliency = saliencyVideoRef.current;

    const handleTimeUpdate = () => {
      if (clipped) {
        const frameRate = fps; // Adjust this according to your video's frame rate
        const frame = Math.floor((clipped.currentTime * frameRate));
        setCurrentFrame(frame);
      }
    };

    clipped && clipped.addEventListener('timeupdate', handleTimeUpdate);
    saliency && saliency.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      clipped && clipped.removeEventListener('timeupdate', handleTimeUpdate);
      saliency && saliency.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  useEffect(() => {
    if (short && short.short_video_saliency) {
      setLoading(true);
      FirebaseStorageService.downloadFile(short.short_video_saliency).then((res) => {
        const url = URL.createObjectURL(res);
        setVideoUrls(prevState => {
          return {...prevState, saliencyVideo: url}
        })
        setLoading(false);
      }).catch((err) => {
        setVideoUrls(prevState => {
          return {...prevState, saliencyVideo: err}
        })
        setLoading(false);
      })
    }

    if (short && short.short_clipped_video) {
      setLoading(true);
      FirebaseStorageService.downloadFile(short.short_clipped_video).then((res) => {
        const url = URL.createObjectURL(res);
        setVideoUrls(prevState => {
          return {...prevState, clippedVideo: url}
        })
        setLoading(false);
      }).catch((err) => {
        setVideoUrls(prevState => {
          return {...prevState, clippedVideo: err}
        })
        setLoading(false);
      })
    }
  }, [short]);

  const handlePlayPause = () => {
    const clipped = clippedVideoRef.current;
    const saliency = saliencyVideoRef.current;
    if (clipped && saliency) {
      if (clipped.paused) {
        const playPromise = clipped.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            saliency.play().catch(err => console.error("Failed to play saliency video:", err));
          }).catch(err => {
            console.error("Failed to play clipped video:", err);
          });
        }
        setPause(false);
      } else {
        setPause(true);
        clipped.pause();
        saliency.pause();
      }
    }
  };

  const handleFrameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const frameIndex = parseInt(e.target.value);
    setCurrentFrame(frameIndex);
    // Optionally, adjust video playback if needed
    if (clippedVideoRef.current && saliencyVideoRef.current) {
      const time = frameIndex / fps;  // Assuming 30 fps for example
      clippedVideoRef.current.currentTime = time;
      saliencyVideoRef.current.currentTime = time;
    }
  };


  const SeekBar = ({currentFrame}: {currentFrame: number}) => {
    const intervals = short.cuts.slice(0, short.cuts.length - 1).map((cut, index) => {
      return {start: cut, end: short.cuts[index + 1] - 1};
    });

    // Optionally, include the last interval if needed, up to totalFrames
    if (short.cuts.length > 0) {
      intervals.push({start: short.cuts[short.cuts.length - 1], end: totalFrames - 1});
    }

    const currentIntervalIndex = intervals.findIndex(interval => currentFrame >= interval.start && currentFrame <= interval.end);

    return <div
      className="seek-bar relative w-full h-12 bg-emerald-950 border border-primary rounded flex justify-center items-center overflow-hidden">
      <input
        type="range"
        min="0"
        max={totalFrames - 1}
        value={currentFrame}
        onChange={handleFrameChange}
        className={"slider absolute w-full z-50 opacity-30"}
      />

      {Array.from({length: totalFrames}, (_, frame) => {
        let color = 'bg-white/30'; // Default color for non-special frames

        // Determine if the frame is within any interval
        const intervalIndex = intervals.findIndex(interval => frame >= interval.start && frame <= interval.end);
        const isCut = short.cuts.includes(frame);
        const isCurrent = currentFrame === frame;

        if (isCut) {
          color = 'bg-primary'; // Color for cuts
        }
        if (isCurrent) {
          color = 'bg-red-50'; // Color for the current frame
        }


        if (intervalIndex === currentIntervalIndex) {
          color = 'bg-blue-300/50'; // Highlight the current interval
        }

        return (
          <div
            key={frame}
            className={`absolute w-[1px] h-full rounded ${color}`}
            style={{
              left: `${(frame / totalFrames) * 100}%`,
            }}
          ></div>
        );
      })}
      <div
        className="absolute w-full h-full bg-gray-950/60"
        style={{
          right: `${((totalFrames - 2 - currentFrame) / totalFrames) * 100}%`,
        }}
      />
    </div>;
  };

  return <div className="w-full flex flex-col gap-2 items-center">
    {
      loading ?
        <div className="w-full h-full flex justify-center items-center py-16">
          <LoadingIcon id={"video-player-loader"} text={"Loading Videos..."}/>
        </div> :
        <div className="flex  w-full flex-col gap-2 h-full">
          <div className="video-overlay-container w-full mt-5" style={{ position: 'relative' }}>
            {
              videoUrls.clippedVideo &&
              <video ref={clippedVideoRef} id="videoElement" className="z-10 w-full" playsInline webkit-playsinline>
                <source src={videoUrls.clippedVideo} type="video/mp4"/>
              </video>
            }
            {
              videoUrls.saliencyVideo &&
              <video ref={saliencyVideoRef} id="videoElement" className="absolute top-0 left-0 z-20 w-full" style={{opacity: opacity/100}} playsInline webkit-playsinline>
                <source src={videoUrls.saliencyVideo} type="video/mp4"/>
              </video>
            }
            <canvas ref={canvasRef} id="canvasOverlay" style={{ position: 'absolute', top: 0, left: 0, zIndex: 45, width: "100%", height: "100%"}}></canvas>
          </div>
          <div className="flex flex-col gap-2 my-2">
            {/* I need to make a media player here - shorts.cuts represents frames where theres a camera cut */}
            {/* and shorts.total_frame_count is the total number of frames... */}
            <div className="flex gap-2">
              <button onClick={handlePlayPause} type="button" className="text-white border-white border font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 ">
                {pause ?
                  <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8l8-6a1 1 0 0 0 0-1.6l-8-6Z" clipRule="evenodd"/>
                  </svg> :
                  <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M8 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H8Zm7 0a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1Z" clipRule="evenodd"/>
                  </svg>
                }
                <span className="sr-only">Icon description</span>
              </button>
              <SeekBar currentFrame={currentFrame}/>
            </div>
            <label htmlFor="steps-range" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white w-full">
              Set Saliency Opacity
              <input
                id="steps-range"
                type="range"
                min="0"
                max="100"
                value={opacity}
                step="0.5"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                onChange={(e) => {setOpacity(parseFloat(e.target.value))}}
              />
            </label>

          </div>
        </div>
    }

    {
      short.visual_difference && short.saliency_values && <AreaUnderChart  saliencyCaptured={short.saliency_values} visualDifference={short.visual_difference}/>
    }



    <div className="inline-flex rounded-md shadow-sm" role="group">
      <button
        type="button"
        className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
        onClick={() => {
          FirebaseFirestoreService.updateDocument(
            "shorts",
            shortId,
            {
              "short_status": "Determine Video Boundaries",
              "previous_short_status": "Requested to Determine Video Boundaries"
            },
            () => {showNotification("Success", "Requested to find cuts.", "success")},
            (error) => {showNotification("Failed", error.message, "error")},
          )
        }}
      >
        Find Cuts
      </button>
      <button
        onClick={() => {
          FirebaseFirestoreService.updateDocument(
            "shorts",
            shortId,
            {
              "short_status": "Get Bounding Boxes",
              "previous_short_status": "Requested to Get Bounding Boxes"
            },
            () => {showNotification("Success", "Requested to find cuts.", "success")},
            (error) => {showNotification("Failed", error.message, "error")},
          )
        }}
        disabled={!short.cuts}
        type="button"
        className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white disabled:bg-gray-900 disabled:hover:bg-gray-900">
        Generate Bounding Boxes
      </button>
      <button onClick={() => {}} type="button" className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
        Re-Adjust Transcript
      </button>
    </div>
  </div>
}