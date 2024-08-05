import React from 'react';
import { Boxes } from "../../../types/collections/Shorts";

interface ClipPathOverlayProps {
  boxes: Boxes | Boxes[];
  currentBoxType: string;
  width: number;
  height: number;
}

const ClipPathOverlay: React.FC<ClipPathOverlayProps> = ({ boxes, currentBoxType, width, height }) => {
  const renderBox = (box: Boxes, index: number) => (
    <g key={`box-${index}`}>
      <rect
        x={box[0]}
        y={box[1]}
        width={box[2]}
        height={box[3]}
        fill="none"
      />
      <rect
        x={box[0]}
        y={box[1]}
        width={box[2]}
        height={box[3]}
        fill="none"
        stroke="#10b981" // Tailwind emerald-500 color
        strokeWidth="2"
        strokeDasharray="5,5"
      />
    </g>
  );
  
  const getMaskContent = () => {
    const renderBox = (box: Boxes) => (
      <rect
        key={box.join(',')}
        x={box[0]}
        y={box[1]}
        width={box[2]}
        height={box[3]}
        fill="black"
      />
    );

    if (Array.isArray(boxes[0])) {
      // Multiple boxes
      return (boxes as Boxes[]).map(renderBox);
    } else {
      // Single box
      return renderBox(boxes as Boxes);
    }
  };

  const getBoxes = () => {
    if (Array.isArray(boxes[0])) {
      // Multiple boxes
      return (boxes as Boxes[]).map((box, index) => renderBox(box, index));
    } else {
      // Single box
      return renderBox(boxes as Boxes, 0);
    }
  };

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full z-50"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <mask id="highlight-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          {getMaskContent()}
        </mask>
      </defs>
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="rgba(0, 255, 0, 0.3)"
        mask="url(#highlight-mask)"
      />
      {getBoxes()}
    </svg>
  );
};

export default ClipPathOverlay;
