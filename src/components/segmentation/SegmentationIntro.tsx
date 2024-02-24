import React, {useEffect, useState} from "react";
import {PageState} from "../../pages/SegmentationHandlingPage";
import {SegmentationGroup} from "../../types/segmentation-masks/SegmentationGroup";

export interface SegmentationIntroProps {
    setPageState: (pageState: PageState) => void;
    videoFile: string;
    getNewVideoFile: () => void;
    getSegmentationGroup: () => void;
    segmentationGroup: SegmentationGroup;
}

export const SegmentationIntro : React.FC<SegmentationIntroProps> = ({setPageState, videoFile, getNewVideoFile, getSegmentationGroup, segmentationGroup}) => {
    const [loadingSegmentation, setLoadingSegment] = useState(false);

    useEffect(() => {
        setLoadingSegment(segmentationGroup.spacialGroups.length !== 0 );
    }, [segmentationGroup]);

    return <div className={"text-white flex flex-col gap-5"}>
        <h1 className={"text-title"}>Segmentation</h1>
        <p>
            What is segmentation? Segmentation is the process of dividing things. For example, you can segment an image
            into appropriate masks, this is dividing the image into regions of "stuff". Then we can segment across
            time, segmenting across time results in grouping together frames into appropriate objects.
        </p>
        <p>We focus on two aspects:
            1) Spacial Segmentation: Dividing things in the frame up into 'significant' segments
            2) Temporal Grouping: Grouping together those 'significant' segments across time.
        </p>

        <p>Video File: {videoFile}</p>
        <p>Segmentation Group: {segmentationGroup.videoId}</p>



        <button
            className={"bg-accent w-[200px] text-background h-[50px] rounded"}
            onClick={() => {
                if (!loadingSegmentation) {
                    setLoadingSegment(true);
                    getNewVideoFile();
                    setLoadingSegment(false);
                } else {
                    console.log("Failed")
                }
            }}> Get Video File </button>

        {!loadingSegmentation && <button
            className={"bg-accent w-[200px] text-background h-[50px] rounded"}
            onClick={() => {
                if (!loadingSegmentation) {
                    setLoadingSegment(true);
                    getSegmentationGroup()
                }
            }}> Get Segmentation Group </button>}

        <button
            className={"bg-accent w-[200px] text-background h-[50px] rounded"}
            onClick={() => {setPageState("SpacialSegmentation")}}> Begin Segmentation </button>
    </div>
}