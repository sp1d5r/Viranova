import React, { useRef, useEffect, useState } from 'react';
import { SegmentationMask } from "../../types/segmentation-masks/SegmentationMask";

interface TemporalSegmentationCanvasProps {
  leftMasks: SegmentationMask[];
  rightMasks: SegmentationMask[];
  leftGroups: number[];
  rightGroups: number[];
  setLeftGroups: (groups: number[]) => void;
  setRightGroups: (groups: number[]) => void;
  leftImageSrc: string;
  rightImageSrc: string;
}

const TemporalSegmentationCanvas: React.FC<TemporalSegmentationCanvasProps> = ({
                                                                                 leftMasks,
                                                                                 rightMasks,
                                                                                 leftGroups,
                                                                                 rightGroups,
                                                                                 setLeftGroups,
                                                                                 setRightGroups,
                                                                                 leftImageSrc,
                                                                                 rightImageSrc,
                                                                               }) => {
  const leftCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentSelectedLeft, setCurrentSelectedLeft] = useState<Set<number>>(new Set());
  const [currentSelectedRight, setCurrentSelectedRight] = useState<Set<number>>(new Set());
  const [groupColors, setGroupColors] = useState<{[key: number]: string}>({});

  useEffect(() => {
    const newGroupColors: {[key: number]: string} = {};
    [...leftGroups, ...rightGroups].forEach(group => {
      if (!newGroupColors[group]) {
        newGroupColors[group] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      }
    });

    setGroupColors(newGroupColors);
  }, [leftGroups, rightGroups]);

  const drawMasks = (canvasRef: React.RefObject<HTMLCanvasElement>, masks: SegmentationMask[], groups: number[], currentSelected: Set<number>) => {
    const canvas = canvasRef.current;
    if (canvas && canvas.getContext) {
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings
        masks.forEach((mask, index) => {
          const isSelected = currentSelected.has(index);
          const color = isSelected ? "#ffffff" : groupColors[groups[index]];
          drawMask(context, mask.mask, color);
        });
      }
    }
  };

  useEffect(() => {
    drawMasks(leftCanvasRef, leftMasks, leftGroups, currentSelectedLeft);
    drawMasks(rightCanvasRef, rightMasks, rightGroups, currentSelectedRight);
  }, [leftMasks, rightMasks, leftGroups, rightGroups, currentSelectedLeft, currentSelectedRight, groupColors]);

  const handleClick = (canvasRef: React.RefObject<HTMLCanvasElement>, masks: SegmentationMask[], setCurrentSelected: React.Dispatch<React.SetStateAction<Set<number>>>) => (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const clickedMaskIndex = masks.findIndex(mask => {
      const maskData = mask.mask;
      const pixelX = Math.floor(x);
      const pixelY = Math.floor(y);
      return maskData[pixelY] && maskData[pixelY][pixelX] === 1;
    });

    if (clickedMaskIndex !== -1) {
      setCurrentSelected(prevSelected => {
        const newSelected = new Set(prevSelected);
        if (newSelected.has(clickedMaskIndex)) {
          newSelected.delete(clickedMaskIndex);
        } else {
          newSelected.add(clickedMaskIndex);
        }
        return newSelected;
      });
    }
  };

  const mergeGroups = () => {
    // Implement the logic to merge groups across left and right frames
    // This might involve updating both leftGroups and rightGroups based on the selections
    // For simplicity, this function is left as an exercise to implement
  };

  return (
    <div className="w-full h-full flex gap-4 justify-center items-start">
      <div className="flex flex-col items-center">
        <h1>Frame i</h1>
        <img src={leftImageSrc} alt="Left Frame" className="w-[440px] h-[440px] object-contain" />
        <canvas ref={leftCanvasRef} width={440} height={440} onClick={handleClick(leftCanvasRef, leftMasks, setCurrentSelectedLeft)} />
      </div>
      <div className="flex flex-col items-center">
        <h1>Frame i+1</h1>
        <img src={rightImageSrc} alt="Right Frame" className="w-[440px] h-[440px] object-contain" />
        <canvas ref={rightCanvasRef} width={440} height={440} onClick={handleClick(rightCanvasRef, rightMasks, setCurrentSelectedRight)} />
      </div>
      <button onClick={mergeGroups} className="py-2 px-4 bg-blue-500 text-white rounded">Merge Selected Groups</button>
    </div>
  );
};

export default TemporalSegmentationCanvas;

const drawMask = (context: CanvasRenderingContext2D, maskData: number[][], color: string) => {
  context.fillStyle = color;
  maskData.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 1) {
        context.fillRect(x, y, 1, 1);
      }
    });
  });
};
