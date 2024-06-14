import React, { useState, useRef } from 'react';
import {Short} from "../../../types/collections/Shorts";
import {VideoEditor} from "../video-editor/VideoEditor"; // You can create and style this CSS file as needed

export interface AfterEffectsProps {
  short: Short;
  shortId: string;
}

const AfterEffects: React.FC<AfterEffectsProps> = ({ short, shortId }) => {
  const [imageTracks, setImageTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleAddImageTrack = () => {
    // Implement logic to add image track
  };

  const handleAddAudioTrack = () => {
    // Implement logic to add audio track
  };

  const handleFrameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const frameIndex = parseInt(e.target.value);
    setCurrentFrame(frameIndex);
    if (videoRef.current) {
      const time = frameIndex / short.fps;
      videoRef.current.currentTime = time;
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 items-center">
      <VideoEditor short={short} shortId={shortId} currentFrame={currentFrame} setCurrentFrame={setCurrentFrame}/>

      <div className="controls">
        <button onClick={handleAddImageTrack} className="btn btn-primary">Add Image Track</button>
        <button onClick={handleAddAudioTrack} className="btn btn-secondary">Add Audio Track</button>
      </div>

      <div className="timeline">
        <label htmlFor="frame-range" className="frame-label">
          Current Frame: {currentFrame}
          <input
            id="frame-range"
            type="range"
            min="0"
            max={short.total_frame_count - 1}
            value={currentFrame}
            onChange={handleFrameChange}
            className="frame-slider"
          />
        </label>
      </div>

      {/* Placeholder for image tracks */}
      {imageTracks.map((track, index) => (
        <div key={index} className="track">
          {/* Implement UI for each image track */}
        </div>
      ))}

      {/* Placeholder for audio tracks */}
      {audioTracks.map((track, index) => (
        <div key={index} className="track">
          {/* Implement UI for each audio track */}
        </div>
      ))}
    </div>
  );
};

export default AfterEffects;