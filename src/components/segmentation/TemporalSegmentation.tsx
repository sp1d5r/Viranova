import React, {useState} from "react";
import {PageState} from "../../pages/SegmentationHandlingPage";
import {SegmentationGroup, spacialSegmentationGroupToDocument} from "../../types/segmentation-masks/SegmentationGroup";
import FirebaseDatabaseService from "../../services/database/strategies/FirebaseFirestoreService";
import {useNotification} from "../../contexts/NotificationProvider";
import TemporalSegmentationCanvas from "./TemporalSegmentationCanvas";

export interface TemporalSegmentationProps {
  setPageState: (pageState: PageState) => void;
  segmentationGroup: SegmentationGroup;
}

export const TemporalSegmentation: React.FC<TemporalSegmentationProps> = ({setPageState, segmentationGroup}) => {
  const [currentFrame, setCurrentFrame] = useState<number>(-1);
  const {showNotification} = useNotification();

  const updateTemporalSegmentationGroups = (group: number[]) => {

  }


  return <div className={"text-white w-full h-full flex flex-col justify-center items-center gap-5"}>
    <div className={" flex justify-center items-center flex-col text-center"}>
      <h1 className={"text-title"}>Temporal Segmentation</h1>
      <span>
          Now we've segmented spatially, we need to segment temporally too. This involves tracking segments across
          time.
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

      {
        currentFrame === segmentationGroup.frames.length -1 && <div className={"w-[80%] text-center"}>
          <h1 className={"text-primary text-title"}>Nice Job!</h1>
          <p>
            Click on Submit and we can move to the next stage! Temporal Segmentation
          </p>
        </div>
      }

      {
        currentFrame >= 1 && <TemporalSegmentationCanvas
          leftMasks={segmentationGroup.segmentationMasks[currentFrame-1]}
          rightMasks={segmentationGroup.segmentationMasks[currentFrame]}
          leftGroups={segmentationGroup.spacialGroups[currentFrame-1]}
          rightGroups={segmentationGroup.spacialGroups[currentFrame]}
          setLeftGroups={(groups)=>{}}
          setRightGroups={(groups)=>{}}
          leftImageSrc={`data:image/png;base64,${segmentationGroup.frames[currentFrame-1].imageData}`}
          rightImageSrc={`data:image/png;base64,${segmentationGroup.frames[currentFrame].imageData}`}
        />
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