import React, {useEffect, useState} from 'react';
import {Short} from "../../types/collections/Shorts";
import {useNotification} from "../../contexts/NotificationProvider";
import {Segment} from "../../types/collections/Segment";
import {SegmentVideo} from "./attention-options/SegmentVideo";
import {PreviewShortVideo} from "./attention-options/PreviewShortVideo";
import {SaliencyVideo} from "./attention-options/SaliencyVideo";
import {Tabs} from "../../pages/Shorts";
import {BoundingBoxSuggestions} from "./attention-options/BoundingBoxSuggestions";
import {LoadingIcon} from "../loading/Loading";
import Stepper from "../stepper/Stepper";
import AfterEffects from "./attention-options/AfterEffects";

export interface AttentionTabProps{
  short: Short;
  shortId: string;
  segment: Segment;
  setTab: React.Dispatch<React.SetStateAction<Tabs>>;
}

type AttentionOptions = "View Segment Video" | "Preview Clipped Video" | "Saliency" | "Bounding Box Suggestions" | "After Effects";
const options : AttentionOptions[] = ["View Segment Video", "Preview Clipped Video", "Saliency", "Bounding Box Suggestions", "After Effects"];

export const AttentionTab: React.FC<AttentionTabProps> = ({short, shortId, segment, setTab}) => {
  const [selectedOption, setSelectedOption] = useState<AttentionOptions>("View Segment Video");
  const [currentTab, setCurrentTab] = useState(0);
  const {showNotification} = useNotification();

  useEffect(() => {
    setCurrentTab(0);

    if (short.short_clipped_video) {
      setCurrentTab(1);
    }

    if (short.short_video_saliency) {
      setCurrentTab(2);
    }

    if (short.cuts) {
      setCurrentTab(3);
    }
  }, [short]);

  return (
    <div className="p-6 text-medium text-gray-400 bg-gray-900 rounded-lg w-full">
      <h3 className="text-xl font-bold text-white mb-2">Attention Capture</h3>
      <p className="mb-2">
        Aim of the game is to maximise attention.
        In the previous version we analysed the transcript aimed to
        create a story. Here we'll focus on capturing that attention visually.
      </p>


      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">Select your country</label>
        <select id="tabs" value={selectedOption} onChange={(e) => {setSelectedOption(e.target.value as AttentionOptions)}} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
          {
            options.map((elem, index) => {
              return <option key={index}>{elem}</option>
            })
          }
        </select>
      </div>

      <Stepper
        steps={[
          {title: "Segment Video", details: "View segment video"},
          {title: "Clipped Video", details: "Preview clipped video"},
          {title: "Saliency", details: "Preview clipped saliency"},
          {title: "Bounding Boxes", details: "Create bounding boxes"},
          {title: "After Effects", details: "Add final touches"},
        ]}
        currentStep={currentTab}
        onStepClick={
          (value: number) => {
            setCurrentTab(value);
          }
        } />

      { !short.pending_operation && options[currentTab] === "View Segment Video" && <SegmentVideo segment={segment} segmentId={short.segment_id} continueButton={() => {setSelectedOption("Preview Clipped Video")}} /> }
      { !short.pending_operation && options[currentTab] === "Preview Clipped Video" && <PreviewShortVideo short={short} shortId={shortId} continueButton={(()=>{setTab("Transcript Editor")})}/> }
      { !short.pending_operation && options[currentTab] === "Saliency" && <SaliencyVideo short={short} shortId={shortId} /> }
      { !short.pending_operation && options[currentTab] === "Bounding Box Suggestions" && <BoundingBoxSuggestions short={short} shortId={shortId} /> }
      { !short.pending_operation && options[currentTab] === "After Effects" && <AfterEffects short={short} shortId={shortId} />}
      { short.pending_operation && <LoadingIcon id={"something"} text={"Performing Operation"} className="my-10"/> }

    </div>
  );
}