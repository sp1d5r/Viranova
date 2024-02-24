import React, {useState} from "react";
import {SegmentationGroup} from "../../types/segmentation-masks/SegmentationGroup";
import {PageState} from "../../pages/SegmentationHandlingPage";
import SegmentationCanvas from "./SegmentationCanvas";

export interface SpacialSegmentationProps {
    segmentationGroup: SegmentationGroup,
    setSegmentationGroup: (segmentationGroup: SegmentationGroup) => void;
    setPageState: (pageState: PageState) => void;
}

export const SpacialSegmentation : React.FC<SpacialSegmentationProps> = ({segmentationGroup, setSegmentationGroup, setPageState}) => {
    const [currentFrame, setCurrentFrame] = useState<number>(-1)


    const updateSpacialGroups = (group: number[]) => {
        const spacialGroups: number[][] = segmentationGroup.spacialGroups.map((oldGroup, index) => index === currentFrame ? group : oldGroup)
        setSegmentationGroup({...segmentationGroup, spacialGroups: spacialGroups});
    }


    return <div className={"text-accent w-full h-full"}>
        <h1 className={"text-title"}>Spacial Segmentation</h1>
        <div className={"flex w-full justify-evenly items-center"}>
            <button onClick={() => {setCurrentFrame(prevState => prevState-1)}}>Go Back</button>
            <button onClick={() => {setCurrentFrame(prevState => prevState+1)}}>Go Forward</button>
        </div>

        {currentFrame !== -1 && <div className={"w-full h-[80vh]"}>
            <div className={"w-[80%] h-full"}>
                <img src={"data:image/png;base64," + segmentationGroup.frames[currentFrame].imageData} alt={"frame"} />
                <SegmentationCanvas
                    masks={segmentationGroup.segmentationMasks[currentFrame]}
                    groups={segmentationGroup.spacialGroups[currentFrame]}
                    setGroups={updateSpacialGroups}
                />
            </div>
        </div>}

    </div>
}