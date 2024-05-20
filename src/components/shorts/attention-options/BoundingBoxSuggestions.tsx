import React, {useEffect, useRef, useState} from "react";
import {Short} from "../../../types/collections/Shorts";
import {FirebaseStorageService} from "../../../services/storage/strategies";
import {LoadingIcon} from "../../loading/Loading";
import {AreaUnderChart} from "../../charts/AreaUnderChart";
import FirebaseFirestoreService from "../../../services/database/strategies/FirebaseFirestoreService";
import {useNotificaiton} from "../../../contexts/NotificationProvider";

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
  const {showNotification} = useNotificaiton();
  const [videoUrls, setVideoUrls] = useState<VideoInfo>({clippedVideo: undefined, saliencyVideo: undefined});
  const [opacity, setOpacity] = useState(0);

  const clippedVideoRef = useRef<HTMLVideoElement>(null);
  const saliencyVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    console.log(short.visual_difference);
    console.log(short.saliency_values);
  }, [])

  function drawBoundingBoxes(ctx: CanvasRenderingContext2D, currentTime: number, video: HTMLVideoElement) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear previous drawings

    if (short.bounding_boxes && short.bounding_boxes['boxes']) {
      const boxes = short.bounding_boxes['boxes'];

      const frameNumber = Math.floor(currentTime * 30); // Example: videoFrameRate is frames per second
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
          if (ctx && !video.paused && !video.ended) {
            drawBoundingBoxes(ctx, video.currentTime, video);
            requestAnimationFrame(render);
          }
        };
        requestAnimationFrame(render);
      });
    }
  }, [canvasRef.current, clippedVideoRef.current]);


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
      } else {
        clipped.pause();
        saliency.pause();
      }
    }
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
              <video ref={clippedVideoRef} id="videoElement" className="z-10 w-full">
                <source src={videoUrls.clippedVideo} type="video/mp4"/>
              </video>
            }
            {
              videoUrls.saliencyVideo &&
              <video ref={saliencyVideoRef} id="videoElement" className="absolute top-0 left-0 z-20 w-full" style={{opacity: opacity/100}}>
                <source src={videoUrls.saliencyVideo} type="video/mp4"/>
              </video>
            }
            <canvas ref={canvasRef} id="canvasOverlay" style={{ position: 'absolute', top: 0, left: 0, zIndex: 50, width: "100%", height: "100%"}}></canvas>
          </div>
          <div className="flex flex-col gap-2 my-2">
            {/* I need to make a media player here - shorts.cuts represents frames where theres a camera cut */}
            {/* and shorts.total_frame_count is the total number of frames... */}
            <button onClick={handlePlayPause} className="p-2 bg-blue-500 text-white rounded">
              Play/Pause
            </button>
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