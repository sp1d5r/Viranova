import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Short, BoundingBoxes, TwoBoundingBoxes, Boxes } from "../../../types/collections/Shorts";
import { FirebaseStorageService } from "../../../services/storage/strategies";
import { LoadingIcon } from "../../loading/Loading";
import FirebaseFirestoreService from "../../../services/database/strategies/FirebaseFirestoreService";
import { useNotification } from "../../../contexts/NotificationProvider";
import "./bounding-box.css";
import ClipPathOverlay from "./ClipPathOverlay";
import {Button} from "../../ui/button";
import {Slider} from "../../ui/slider";

export interface BoundingBoxSuggestionsProps {
  short: Short;
  shortId: string;
}

type VideoInfo = {
  clippedVideo: string | undefined;
  saliencyVideo: string | undefined;
}

export const BoundingBoxSuggestions: React.FC<BoundingBoxSuggestionsProps> = ({ short, shortId }) => {
  const [loading, setLoading] = useState(true);
  const [pause, setPause] = useState(true); // Initial state set to paused
  const { showNotification } = useNotification();
  const [videoUrls, setVideoUrls] = useState<VideoInfo>({ clippedVideo: undefined, saliencyVideo: undefined });
  const [opacity, setOpacity] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [cuts, setCuts] = useState<number[]>(short.cuts || []);
  const clippedVideoRef = useRef<HTMLVideoElement>(null);
  const saliencyVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [currentBoxType, setCurrentBoxType] = useState<string>("standard_tiktok");

  useEffect(() => {
    if (short.box_type && short.box_type.length >= currentFrame) {
      setCurrentBoxType(short.box_type[currentFrame]);
    }
  }, [currentFrame]);

  useEffect(() => {
    if (short && short.temp_audio_file) {
      setLoading(true);
      FirebaseStorageService.downloadFile(short.temp_audio_file).then((res) => {
        const url = URL.createObjectURL(res);
        setAudioUrl(url);
        setLoading(false);
      }).catch((err) => {
        setLoading(false);
        console.error("Failed to load audio file:", err);
      });
    }
  }, [short]);

  useEffect(() => {
    const loadVideo = async (url: string) => {
      try {
        setLoading(true);
        const res = await FirebaseStorageService.downloadFile(url);
        return URL.createObjectURL(res);
      } catch (err) {
        console.error(`Failed to load video: ${url}`, err);
        return undefined;
      } finally {
        setLoading(false);
      }
    };

    if (short) {
      if (short.short_video_saliency) {
        loadVideo(short.short_video_saliency).then(url =>
          setVideoUrls(prev => ({ ...prev, saliencyVideo: url }))
        );
      }
      if (short.short_clipped_video) {
        loadVideo(short.short_clipped_video).then(url =>
          setVideoUrls(prev => ({ ...prev, clippedVideo: url }))
        );
      }
    }
  }, [short]);

  useEffect(() => {
    const clipped = clippedVideoRef.current;
    const saliency = saliencyVideoRef.current;

    const handleTimeUpdate = () => {
      if (clippedVideoRef.current) {
        const frameRate = short.fps;
        const frame = Math.floor(clippedVideoRef.current.currentTime * frameRate);
        setCurrentFrame(frame);
        if (audioRef.current) {
          audioRef.current.currentTime = clippedVideoRef.current.currentTime;
        }
      }
    };

    clipped && clipped.addEventListener('timeupdate', handleTimeUpdate);
    saliency && saliency.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      clipped && clipped.removeEventListener('timeupdate', handleTimeUpdate);
      saliency && saliency.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [clippedVideoRef.current, saliencyVideoRef.current]);


  const handleBoxTypeChange = (newBoxType: string) => {
    setCurrentBoxType(newBoxType);

    const updatedBoxTypes = [...(short.box_type || [])];
    const currentCutIndex = cuts.findIndex(cut => currentFrame <= cut);
    const startFrame = currentCutIndex > 0 ? cuts[currentCutIndex - 1] + 1 : 0;
    const endFrame = cuts[currentCutIndex] || short.total_frame_count - 1;

    for (let i = startFrame; i <= endFrame; i++) {
      updatedBoxTypes[i] = newBoxType;
    }

    FirebaseFirestoreService.updateDocument(
      "shorts",
      shortId,
      { box_type: updatedBoxTypes },
      () => { showNotification("Success", "Box type updated successfully", "success"); },
      (error) => { showNotification("Error", "Failed to update box type", "error"); }
    );
  };


  const handleFrameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const frameIndex = parseInt(e.target.value);
    setCurrentFrame(frameIndex);
    if (clippedVideoRef.current && saliencyVideoRef.current && audioRef.current) {
      const time = frameIndex / short.fps;
      clippedVideoRef.current.currentTime = time;
      saliencyVideoRef.current.currentTime = time;
      audioRef.current.currentTime = time;
    }
  };

  const [currentBoxes, setCurrentBoxes] = useState<Boxes | Boxes[]>([0, 0, 0, 0]);

  useEffect(() => {
    const updateCurrentBoxes = () => {
      let boxesData;
      switch (currentBoxType) {
        case "standard_tiktok":
        case "picture_in_picture":
          boxesData = short.standard_tiktok;
          break;
        case "reaction_box":
          const reactionData = short.reaction_box;
          const originalData = short.standard_tiktok;
          if (reactionData && originalData)
            setCurrentBoxes([originalData.boxes[currentFrame], reactionData.boxes[currentFrame]])
          break;
        case "two_boxes":
        case "two_boxes_reversed":
          boxesData = short.two_boxes;
          break;
      }

      if (boxesData && boxesData.boxes[currentFrame]) {
        setCurrentBoxes(boxesData.boxes[currentFrame]);
      }
    };

    updateCurrentBoxes();
  }, [currentFrame, currentBoxType, short]);

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

  useEffect(() => {
    const video = clippedVideoRef.current;
    const saliency = saliencyVideoRef.current;
    const audio = audioRef.current;

    const syncPausePlayState = () => {
      if (pause) {
        video?.pause();
        saliency?.pause();
        audio?.pause();
      } else {
        video?.play().catch(() => setPause(true));
        saliency?.play().catch(() => setPause(true));
        audio?.play().catch(() => setPause(true));
      }
    };

    syncPausePlayState();
  }, [pause]);

  if (loading) {
    return (
      <div className="w-full h-full flex justify-center items-center py-16">
        <LoadingIcon id="video-player-loader" text="Loading Videos..." />
      </div>
    );
  }


  return (
    <div className="w-full flex flex-col gap-2 items-center">
      <div className="flex w-full flex-col gap-2 h-full overflow-hidden">
        <div className="relative video-overlay-container w-full mt-5 overflow-hidden">
          {videoUrls.clippedVideo && (
            <video ref={clippedVideoRef} className="z-10 w-full" muted playsInline>
              <source src={videoUrls.clippedVideo} type="video/mp4" />
            </video>
          )}
          {videoUrls.saliencyVideo && (
            <video
              ref={saliencyVideoRef}
              className="absolute top-0 left-0 z-20 w-full"
              style={{ opacity: opacity / 100 }}
              playsInline
            >
              <source src={videoUrls.saliencyVideo} type="video/mp4" />
            </video>
          )}
          <ClipPathOverlay
            boxes={currentBoxes}
            currentBoxType={currentBoxType}
            width={short.width}
            height={short.height}
          />
        </div>
        <div className="w-full flex flex-col justify-center">
          <div className="flex gap-2">
            <Button
              onClick={() => setPause(prevState => !prevState)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              {pause ? "Play" : "Pause"}
            </Button>
            <audio ref={audioRef} src={audioUrl} controls className="w-full" />
          </div>
        </div>
        <div className="flex flex-col gap-2 my-2">
          {cuts && <SeekBar currentFrame={currentFrame} totalFrames={short.total_frame_count} cuts={cuts}/>}
          <Slider
            min={0}
            max={100}
            value={[opacity]}
            onValueChange={(e) => setOpacity(e[0])}
            className="w-full my-2"
          />
        </div>
        <div className="flex gap-2 my-2">
          {["standard_tiktok", "two_boxes", "two_boxes_reversed", "picture_in_picture", "reaction_box"].map((type) => (
            <Button
              key={type}
              onClick={() => handleBoxTypeChange(type)}
              variant={currentBoxType === type ? "default" : "secondary"}
            >
              {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Button>
          ))}
          <div className="flex-1"/>
          <Button
            onClick={() => {
              FirebaseFirestoreService.updateDocument(
                "shorts",
                shortId,
                {
                  previous_short_status: "Generating A-Roll",
                  short_status: "Generate A-Roll",
                },
                () => {
                  showNotification("Success", "Generated A Roll", "success");
                },
                (error) => {
                  showNotification("Success", error.message, "error");
                }
              )
            }}
          >
            Generate A-Roll
          </Button>
        </div>
      </div>
    </div>
  );
};
