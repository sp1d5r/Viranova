import React, {useState} from "react";
import {
    SegmentationGroup,
    spacialSegmentationGroupToDocument
} from "../../types/segmentation-masks/SegmentationGroup";
import {PageState} from "../../pages/SegmentationHandlingPage";
import SpacialSegmentationCanvas from "./SpacialSegmentationCanvas";
import {useNotification} from "../../contexts/NotificationProvider";
import FirebaseDatabaseService from "../../services/database/strategies/FirebaseFirestoreService";

export interface SpacialSegmentationProps {
    segmentationGroup: SegmentationGroup,
    setSegmentationGroup: (segmentationGroup: SegmentationGroup) => void;
    setPageState: (pageState: PageState) => void;
}

export const SpacialSegmentation : React.FC<SpacialSegmentationProps> = ({segmentationGroup, setSegmentationGroup, setPageState}) => {
    const [currentFrame, setCurrentFrame] = useState<number>(-1)
    const {showNotification} = useNotification();

    const updateSpacialGroups = (group: number[]) => {
        const spacialGroups: number[][] = segmentationGroup.spacialGroups.map((oldGroup, index) => index === currentFrame ? group : oldGroup)
        console.log(segmentationGroup.frames.length)
        setSegmentationGroup({...segmentationGroup, spacialGroups: spacialGroups});
    }


    return <div className={"text-white w-full h-full flex flex-col justify-center items-center gap-5"}>
        <div className={" flex justify-center items-center flex-col text-center"}>
            <h1 className={"text-title"}>Spacial Segmentation</h1>
            <span>
                We have a model that extracts segments across frames. But the key problem is these segments aren’t intelligent. The task for us is to merge the segments together.
            </span>
        </div>

        <div className={"w-[80%] bg-gray-100/30 h-[80vh] max-h-[800px] rounded-xl flex justify-center items-center gap-2"}>
            {
                currentFrame == -1 && <div className={"w-[80%] text-center"}>
                    <h1 className={"text-primary text-title"}>Let's begin!</h1>
                    <p>
                        Click on the segments which should be merged together. For example, if you see a guy who's arm is
                        segmented seperately from his body then group those together.
                    </p>

                </div>
            }

            {currentFrame !== -1 && currentFrame !== segmentationGroup.frames.length -1 &&
                <SpacialSegmentationCanvas
                    masks={segmentationGroup.segmentationMasks[currentFrame]}
                    groups={segmentationGroup.spacialGroups[currentFrame]}
                    setGroups={updateSpacialGroups}
                    imageSrc={`data:image/png;base64,${segmentationGroup.frames[currentFrame].imageData}`}
                />
            }

            {
                currentFrame === segmentationGroup.frames.length -1 && <div className={"w-[80%] text-center"}>
                    <h1 className={"text-primary text-title"}>Nice Job!</h1>
                    <p>
                        Click on Submit and we can move to the next stage! Temporal Segmentation
                    </p>
                </div>
            }
        </div>



        <div className={"flex w-full justify-evenly items-center"}>
            <button
                onClick={() => {
                    setCurrentFrame(prevState => Math.max(-1, prevState-1));
                }}
                className={"w-[200px] bg-gray-400/10 hover:bg-gray-400/30 px-5 py-2 rounded border border-white"}>
                <p className={"font-bold hover:underline"}>Previous Frame</p>
            </button>

            <button
                onClick={() => {
                    console.log(segmentationGroup);
                    FirebaseDatabaseService.addDocument(
                        "segmentation_groups",
                        spacialSegmentationGroupToDocument(segmentationGroup),
                        ()=>{
                            showNotification("Uploaded", "Uploaded Results to Database!", "success", 5000);
                            setPageState("TemporalSegmentation");
                        },
                        (error)=>{
                            showNotification("Upload Failed", "We can't submit just yet" + error, "error", 5000)
                        }
                    )

                }}
                className={"w-[200px] bg-green-400/10 hover:bg-green-400/30 px-5 py-2 rounded border border-white"}>
                <p className={"font-bold hover:underline"}>Submit</p>
            </button>

            <button
                onClick={() => {
                    setCurrentFrame(prevState => Math.min(segmentationGroup.frames.length - 1, prevState+1));
                }}
                className={"w-[200px] bg-gray-400/10 hover:bg-gray-400/30 px-5 py-2 rounded border border-white"}>
                <p className={"font-bold hover:underline"}>Next Frame</p>
            </button>

        </div>

    </div>
}