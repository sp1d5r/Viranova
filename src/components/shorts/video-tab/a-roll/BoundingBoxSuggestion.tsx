import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Short, BoundingBoxes, TwoBoundingBoxes, Boxes } from "../../../../types/collections/Shorts";
import { FirebaseStorageService } from "../../../../services/storage/strategies";
import { LoadingIcon } from "../../../loading/Loading";
import FirebaseFirestoreService from "../../../../services/database/strategies/FirebaseFirestoreService";
import { useNotification } from "../../../../contexts/NotificationProvider";
import "./bounding-box.css";
import ClipPathOverlay from "./ClipPathOverlay";
import {Button} from "../../../ui/button";
import {Slider} from "../../../ui/slider";
import {useShortRequestManagement} from "../../../../contexts/ShortRequestProvider";
import {CreditButton} from "../../../ui/credit-button";
import { Card, CardContent } from "../../../ui/card";
import { Check, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";

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
  const { createShortRequest } = useShortRequestManagement();

  const handleAddCut = () => {
    if (!cuts.includes(currentFrame)) {
      const newCuts = [...cuts, currentFrame].sort((a, b) => a - b);
      setCuts(newCuts);

      FirebaseFirestoreService.updateDocument(
        "shorts",
        shortId,
        { cuts: newCuts },
        () => {
          showNotification("Success", "Cut added successfully", "success");
        },
        (error) => {
          showNotification("Error", "Failed to add cut", "error");
          console.error(error);
        }
      );
    } else {
      showNotification("Info", "Cut already exists at this frame", "info");
    }
  };

  const [currentBoxes, setCurrentBoxes] = useState<Boxes | Boxes[]>([0, 0, 0, 0]);
  /* Editing the box position */
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [previewBoxes, setPreviewBoxes] = useState<Boxes | [Boxes, Boxes]>([0, 0, 0, 0]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handlePositionChange = (axis: 'x' | 'y', value: number, boxIndex: number = 0) => {
    setPreviewBoxes((prev) => {
      if (Array.isArray(prev) && Array.isArray(prev[0])) {
        // Handle two-box scenarios
        return prev.map((box, index) => {
          if (index === boxIndex) {
            const [x, y, width, height] = box as Boxes;
            return axis === 'x' ? [value, y, width, height] : [x, value, width, height];
          }
          return box;
        }) as [Boxes, Boxes];
      } else {
        // Handle single-box scenarios
        const [x, y, width, height] = prev as Boxes;
        return axis === 'x' ? [value, y, width, height] : [x, value, width, height];
      }
    });
    setIsPreviewMode(true);
  };
  
  const handleScaleChange = (value: number, boxIndex: number = 0) => {
    setPreviewBoxes((prev) => {
      if (Array.isArray(prev) && Array.isArray(prev[0])) {
        // Handle two-box scenarios
        return prev.map((box, index) => {
          if (index === boxIndex) {
            const [x, y, width, height] = box as Boxes;
            const newHeight = short.height * value;
            const newWidth = (width / height) * newHeight;
            return [x, y, newWidth, newHeight];
          }
          return box;
        }) as [Boxes, Boxes];
      } else {
        // Handle single-box scenarios
        const [x, y, width, height] = prev as Boxes;
        const newHeight = short.height * value;
        const newWidth = (width / height) * newHeight;
        return [x, y, newWidth, newHeight];
      }
    });
    setIsPreviewMode(true);
  };

  const convertCurrentBoxType:(item: "standard_tiktok" | "picture_in_picture" | "reaction_box" | "half_screen_box" | "two_boxes" | "two_boxes_reversed") => "standard_tiktok" | "reaction_box" | "half_screen_box" | "two_boxes" = (item)  => {
    switch (item){
      case "standard_tiktok":
      case "picture_in_picture":
        return "standard_tiktok";
      case "reaction_box":
        return "reaction_box";
      case "half_screen_box":
        return "half_screen_box";
      case "two_boxes":
      case "two_boxes_reversed":
        return "two_boxes";
    }

  }

  const handleConfirm = () => {
    // Update the boxes for the current cut and box type
    const currentCutIndex = cuts.findIndex(cut => currentFrame <= cut);
    const startFrame = currentCutIndex > 0 ? cuts[currentCutIndex - 1] + 1 : 0;
    const endFrame = cuts[currentCutIndex] || short.total_frame_count - 1;

    let updatedBoxes: Boxes[] | [Boxes, Boxes][];

    switch (currentBoxType) {
      case "standard_tiktok":
      case "picture_in_picture":
        updatedBoxes = short.standard_tiktok!.boxes;
        break;
      case "reaction_box":
        updatedBoxes = short.reaction_box!.boxes;
        break;
      case "half_screen_box":
        updatedBoxes = short.half_screen_box!.boxes;
        break;
      case "two_boxes":
      case "two_boxes_reversed":
        updatedBoxes = short.two_boxes!.boxes;
        break;
      default:
        return;
    }

    if (updatedBoxes) {
      for (let i = startFrame; i <= endFrame; i++) {
        (updatedBoxes as any)[i] = previewBoxes;
      }

      const newBoxe: { [key: string]: Boxes[] | [Boxes, Boxes][] } = {
        "standard_tiktok": short.standard_tiktok!.boxes,
        "reaction_box": short.reaction_box!.boxes,
        "two_boxes": short.two_boxes!.boxes,
        "half_screen_box": short.half_screen_box!.boxes, 
      }


      newBoxe[convertCurrentBoxType(currentBoxType)]= updatedBoxes;
  
      FirebaseFirestoreService.updateDocument(
        "shorts",
        shortId,
        { bounding_boxes: JSON.stringify(newBoxe)},
        () => {
          showNotification("Success", "Bounding box updated successfully", "success");
          setIsPreviewMode(false);
        },
        (error) => { showNotification("Error", "Failed to update bounding box", "error"); console.log(error)}
      );
    }
  };

  const getBoxValue = (index: number, boxIndex: number = 0): number => {
    if (Array.isArray(previewBoxes) && Array.isArray(previewBoxes[0])) {
      const boxes = previewBoxes as [Boxes, Boxes];
      return boxes[boxIndex][index];
    } else if (Array.isArray(previewBoxes)) {
      return previewBoxes[index] as number;
    }
    return 0;
  };
  
  const getScaleValue = (boxIndex: number = 0): number => {
    const height = getBoxValue(3, boxIndex);
    return height / short.height;
  };


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

  useEffect(() => {
    const updateCurrentBoxes = () => {
      let boxesData: BoundingBoxes | TwoBoundingBoxes | undefined;
      switch (currentBoxType) {
        case "standard_tiktok":
        case "picture_in_picture":
          boxesData = short.standard_tiktok;
          break;
        case "reaction_box":
          boxesData = short.reaction_box;
          break;
        case "half_screen_box":
          boxesData = short.half_screen_box
          break;
        case "two_boxes":
        case "two_boxes_reversed":
          boxesData = short.two_boxes;
          break;
      }

      if (boxesData && boxesData.boxes[currentFrame]) {
        console.log(boxesData);
        setCurrentBoxes(boxesData.boxes[currentFrame]);
        setPreviewBoxes(boxesData.boxes[currentFrame]);
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
      <div className="flex max-w-screen-xl w-full flex-col gap-2 h-full overflow-hidden">
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
            boxes={previewBoxes}
            currentBoxType={currentBoxType}
            width={short.width}
            height={short.height}
          />
          <Card className="absolute top-4 right-4 w-64 z-30 !bg-black/30 !text-xs md:text-md">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Adjust Boxes</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPanelOpen(!isPanelOpen)}
                >
                  {isPanelOpen ? <ChevronUp /> : <ChevronDown />}
                </Button>
              </div>
              {isPanelOpen && (
                <>
                  {['two_boxes', 'two_boxes_reversed'].includes(currentBoxType) ? (
                    // Render controls for both boxes
                    [0, 1].map((boxIndex) => (
                      <div key={boxIndex} className="space-y-2 mt-4">
                        <h4 className="font-semibold">Box {boxIndex + 1}</h4>
                        <div>
                          <Label htmlFor={`x-position-${boxIndex}`}>X Position</Label>
                          <Slider
                            id={`x-position-${boxIndex}`}
                            min={0}
                            max={short.width}
                            step={1}
                            value={[getBoxValue(0, boxIndex)]}
                            onValueChange={(value) => handlePositionChange('x', value[0], boxIndex)}
                          />
                          <div className="text-xs text-right mt-1">{getBoxValue(0, boxIndex)}</div>
                        </div>
                        <div>
                          <Label htmlFor={`y-position-${boxIndex}`}>Y Position</Label>
                          <Slider
                            id={`y-position-${boxIndex}`}
                            min={0}
                            max={short.height}
                            step={1}
                            value={[getBoxValue(1, boxIndex)]}
                            onValueChange={(value) => handlePositionChange('y', value[0], boxIndex)}
                          />
                          <div className="text-xs text-right mt-1">{getBoxValue(1, boxIndex)}</div>
                        </div>
                        <div>
                          <Label htmlFor={`scale-${boxIndex}`}>Scale</Label>
                          <Slider
                            id={`scale-${boxIndex}`}
                            min={0}
                            max={1}
                            step={0.01}
                            value={[getScaleValue(boxIndex)]}
                            onValueChange={(value) => handleScaleChange(value[0], boxIndex)}
                          />
                          <div className="text-xs text-right mt-1">{getScaleValue(boxIndex).toFixed(2)}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Render controls for single box (existing code)
                    <div className="space-y-2">
                      <div className="space-y-0">
                    <div>
                      <Label htmlFor="x-position">X Position</Label>
                      <Slider
                        id="x-position"
                        min={0}
                        max={short.width}
                        step={1}
                        value={[getBoxValue(0)]}
                        onValueChange={(value) => handlePositionChange('x', value[0])}
                      />
                      <div className="text-xs text-right mt-1">{getBoxValue(0)}</div>
                    </div>
                    <div>
                      <Label htmlFor="y-position">Y Position</Label>
                      <Slider
                        id="y-position"
                        min={0}
                        max={short.height}
                        step={1}
                        value={[getBoxValue(1)]}
                        onValueChange={(value) => handlePositionChange('y', value[0])}
                      />
                      <div className="text-xs text-right mt-1">{getBoxValue(1)}</div>
                    </div>
                    <div>
                      <Label htmlFor="scale">Scale</Label>
                      <Slider
                        id="scale"
                        min={0}
                        max={1}
                        step={0.01}
                        value={[getScaleValue()]}
                        onValueChange={(value) => handleScaleChange(value[0])}
                      />
                      <div className="text-xs text-right mt-1">{getScaleValue().toFixed(2)}</div>
                    </div>
                  </div>
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={handleAddCut}>
                      <Plus /> Cut
                    </Button>
                    <Button onClick={handleConfirm} disabled={!isPreviewMode}>
                      <Check />  Confirm
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <div className=" z-50 flex gap-2 my-2 flex-wrap absolute bottom-4 right-4">
          {["standard_tiktok", "two_boxes", "two_boxes_reversed", "picture_in_picture", "reaction_box", "half_screen_box"].map((type) => (
            <Button
              key={type}
              onClick={() => handleBoxTypeChange(type)}
              variant={currentBoxType === type ? "default" : "ghost"} 
              className="outline outline-black !text-xs !p-1 !py-1"             
            >
              {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Button>
          ))}
          <div className="flex-1"/>
          <CreditButton
            creditCost={2}
            confirmationMessage={"You are generating A-Roll, make sure this is accurate because it will cost 2 credits."}
            onClick={() => {
              createShortRequest(
                shortId,
                "v1/generate-a-roll",
                2,
                (requestId) => {
                  showNotification("Generate A-Roll", `Request ID: ${requestId}`, "success");
                },
                (error) => {
                  showNotification("Generate A-Roll Failed", `${error}`, "error");
                }
              );
            }}
            cooldown={100}
          >
            Generate A-Roll
          </CreditButton>
        </div>
        </div>
        <div className="w-full flex flex-col justify-center">
          <div className="flex gap-2">
            <Button
              onClick={() => setPause(prevState => !prevState)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              {pause ? "Play" : "Pause"}
            </Button>
            {cuts && <SeekBar currentFrame={currentFrame} totalFrames={short.total_frame_count} cuts={cuts}/>}
          </div>
        </div>
        <div className="flex gap-2 my-2 ">
          <audio ref={audioRef} src={audioUrl} controls={false} className="w-full" />
          <Slider
            min={0}
            max={100}
            value={[opacity]}
            onValueChange={(e) => setOpacity(e[0])}
            className="w-full my-2"
          />
        </div>
      </div>
    </div>
  );
};
