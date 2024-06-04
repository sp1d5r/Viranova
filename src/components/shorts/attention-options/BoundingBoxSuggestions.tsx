import React, {useEffect, useMemo, useRef, useState} from "react";
import {BoundingBoxes, Short} from "../../../types/collections/Shorts";
import {FirebaseStorageService} from "../../../services/storage/strategies";
import {LoadingIcon} from "../../loading/Loading";
import {AreaUnderChart} from "../../charts/AreaUnderChart";
import FirebaseFirestoreService from "../../../services/database/strategies/FirebaseFirestoreService";
import {useNotificaiton} from "../../../contexts/NotificationProvider";
import "./bounding-box.css";
import ManualOverrideControls from "./bounding-boxes/ManualOverrideSegment";

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
  const fps = short.fps;
  const [pause, setPause] = useState(false);
  const {showNotification} = useNotificaiton();
  const [videoUrls, setVideoUrls] = useState<VideoInfo>({clippedVideo: undefined, saliencyVideo: undefined});
  const [opacity, setOpacity] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const clippedVideoRef = useRef<HTMLVideoElement>(null);
  const saliencyVideoRef = useRef<HTMLVideoElement>(null);
  const [internalBoundingBoxes, setInternalBoundingBoxes] = useState<BoundingBoxes | undefined>(short.bounding_boxes);


  useEffect(() => {
    const video = clippedVideoRef.current;

    const handleTimeUpdate = () => {
      if (video) {
        const frameRate = fps;  // Adjust according to video frame rate
        const frame = Math.floor(video.currentTime * frameRate);
        setCurrentFrame(frame);
      }
    };

    video && video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video && video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [clippedVideoRef.current, internalBoundingBoxes]);

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

  const SeekBar = ({ currentFrame, totalFrames, cuts }: { currentFrame:number, totalFrames:number, cuts:number[] }) => {
    const intervals = [];
    let start = 0;

    // Define intervals based on cuts
    cuts.forEach((cut, index) => {
      intervals.push({ start, end: cut });
      start = cut + 1;
    });

    // Add the last interval if necessary
    if (start <= totalFrames - 1) {
      intervals.push({ start, end: totalFrames - 1 });
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
              className={`absolute h-full rounded-md border border-emerald-500  ${isWithinInterval ? 'border border-blue-500 bg-emerald-950' : 'border border-emerald-500 bg-gray-700'}`}
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


  return <div className="w-full flex flex-col gap-2 items-center">
    {
      loading ?
        <div className="w-full h-full flex justify-center items-center py-16">
          <LoadingIcon id={"video-player-loader"} text={"Loading Videos..."}/>
        </div> :
        <div className="flex  w-full flex-col gap-2 h-full overflow-hidden">
          <div className="relative video-overlay-container w-full mt-5 overflow-hidden">
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
            {internalBoundingBoxes && <div className="absolute top-0 left-0 w-full h-full bg-primary opacity-50" style={{
              clipPath: clipPath
            }}
            />
            }

            {internalBoundingBoxes && <div
              className="absolute border-2 border-primary border-dashed"
              style={{
                width: `${(internalBoundingBoxes.boxes[currentFrame][2] / short.width) * 100}%`,
                height: `${(internalBoundingBoxes.boxes[currentFrame][3] / short.height) * 100}%`,
                top: `${(internalBoundingBoxes.boxes[currentFrame][1] / short.height) * 100}%`,
                left: `${(internalBoundingBoxes.boxes[currentFrame][0] / short.width) * 100}%`,
              }}/>}
          </div>
          <div className="w-full flex justify-center">
            {!short.cuts && <p className="text-danger font-bold">Press find cuts to get camera cuts</p>}
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
                    () => {showNotification("Success", "Requested Bounding Boxes", "success")},
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
          <div className="flex flex-col gap-2 my-2">
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
              {short.cuts && <SeekBar currentFrame={currentFrame} totalFrames={short.total_frame_count} cuts={short.cuts}/>}
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

    {internalBoundingBoxes && <ManualOverrideControls cuts={short.cuts} totalFrames={short.total_frame_count} currentFrame={currentFrame} internalBoundingBoxes={internalBoundingBoxes} setInternalBoundingBoxes={setInternalBoundingBoxes} shortId={shortId} short={short} />}

    {/*{ short.visual_difference && short.saliency_values && <AreaUnderChart  saliencyCaptured={short.saliency_values} visualDifference={short.visual_difference}/> }*/}
  </div>
}