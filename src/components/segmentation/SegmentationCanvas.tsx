import React, {useRef, useEffect, useState} from 'react';
import {SegmentationMask} from "../../types/segmentation-masks/SegmentationMask";

interface SegmentationCanvasProps {
    masks: SegmentationMask[];
    groups: number[]; // This represents special indices, not groups of indices
    setGroups: (groups: number[]) => void;
    imageSrc: string;
}

const SegmentationCanvas: React.FC<SegmentationCanvasProps> = ({ masks, groups, setGroups, imageSrc }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [currentSelected, setCurrentSelected] = useState<Set<number>>(new Set());
    const [groupColors, setGroupColors] = useState<{[key: number]: string}>({});

    useEffect(() => {
        const newGroupColors: {[key: number]: string} = {};
        groups.forEach((group, index) => {
            if (!newGroupColors[group]) {
                newGroupColors[group] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
            }
        });
        setGroupColors(newGroupColors);
    }, [groups]);

    useEffect(() => {
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
    }, [masks, currentSelected, groupColors]);

    const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
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

    const updateGroups = () => {
        // Assuming selectedGroups is a Set<number> of selected mask indexes
        // and groups is an array of numbers indicating the group of each mask
        if (currentSelected.size === 0) return; // No selection, no action

        // Find the minimum group ID from the selected groups to merge into
        const minGroup = Math.min(...Array.from(currentSelected).map(index => groups[index]));

        // Create a new groups array where selected masks are set to the same group
        const newGroups = groups.map((group, index) => currentSelected.has(index) ? minGroup : group);

        // Reset selectedGroups after merging
        setCurrentSelected(new Set<number>());

        // Update the groups state with the new groups
        console.log(newGroups);
        setGroups(newGroups); // Assuming you have a setGroups function to update the state
    };

    return <div className={"w-full flex gap-2 justify-center items-start"}>
        <div className={"flex flex-col gap-5 flex-1 items-center p-2"}>
            <p className={"font-bold text-subtitle"}>Original Frame</p>
            <img className={"w-[440px] h-[440px] object-contain"} src={imageSrc} alt={"frame"} />
            <button
                onClick={() => {updateGroups()}}
                className={"w-[200px] bg-blue-400/10 hover:bg-blue-400/30 px-5 py-2 rounded border border-white font-bold"}
            >Merge Groups</button>
            <button
                onClick={() => {setCurrentSelected(new Set<number>())}}
                className={"w-[200px] bg-red-400/10 hover:bg-red-400/30 px-5 py-2 rounded border border-white font-bold"}
            >Reset Groups</button>
        </div>

        <div className={"flex flex-col gap-5 flex-1 items-center p-2"}>
            <p className={"font-bold text-primary text-subtitle"}>Segments</p>
            <canvas ref={canvasRef} width={440} height={440} onClick={handleClick} />
            <div className={"flex flex-wrap gap-2"}>
                {Object.keys(groupColors).map((key) => (
                    <div key={key} className={"flex gap-2"}>
                        <div
                            style={{backgroundColor: groupColors[parseInt(key)]}}
                            className={"w-5 h-5 border border-black rounded"}
                        ></div>
                        <p>Segment {key}</p>
                    </div>
                ))}
            </div>

        </div>

    </div>;
};

export default SegmentationCanvas;

const drawMask = (context: CanvasRenderingContext2D, maskData: number[][], color: string) => {
    context.fillStyle = color;
    maskData.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell === 1) {
                context.fillRect(x, y, 1, 1); // Assuming pixel size of 1 for simplicity
            }
        });
    });
};
