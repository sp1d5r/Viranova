import React, {useState} from 'react';
import {Short} from "../../types/collections/Shorts";
import {useNotificaiton} from "../../contexts/NotificationProvider";
import {Segment} from "../../types/collections/Segment";
import {SegmentVideo} from "./attention-options/SegmentVideo";
import {PreviewShortVideo} from "./attention-options/PreviewShortVideo";
import {SaliencyVideo} from "./attention-options/SaliencyVideo";
import {Tabs} from "../../pages/Shorts";
import {BoundingBoxSuggestions} from "./attention-options/BoundingBoxSuggestions";

export interface AttentionTabProps{
  short: Short;
  shortId: string;
  segment: Segment;
  setTab: React.Dispatch<React.SetStateAction<Tabs>>;
}

type AttentionOptions = "View Segment Video" | "Preview Clipped Video" | "Saliency" | "Bounding Box Suggestions";
const options : AttentionOptions[] = ["View Segment Video", "Preview Clipped Video", "Saliency", "Bounding Box Suggestions"];

export const AttentionTab: React.FC<AttentionTabProps> = ({short, shortId, segment, setTab}) => {
  const [selectedOption, setSelectedOption] = useState<AttentionOptions>("View Segment Video");
  const {showNotification} = useNotificaiton();

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
      <ul className="hidden text-sm font-medium text-center text-gray-500 rounded-lg shadow sm:flex dark:divide-gray-700 dark:text-gray-400">
        {
          options.map((elem, index) => {
            if (elem === selectedOption) {
              return (
                <li className="w-full focus-within:z-10">
                  <button onClick={() => {setSelectedOption(elem)}} className="inline-block h-full w-full p-4 text-gray-900 bg-gray-100 border-x border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-blue-300 active focus:outline-none dark:bg-gray-700 dark:text-white" aria-current="page">
                    {elem}
                  </button>
                </li>
              )
            } else {
              return (
                <li className="w-full focus-within:z-10">
                  <button onClick={() => {setSelectedOption(elem)}} className="inline-block h-full w-full p-4 bg-white border-r border-gray-200 dark:border-gray-700 hover:text-gray-700 hover:bg-gray-50 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700">
                    {elem}
                  </button>
                </li>
              )
            }
          })
        }
      </ul>

      { selectedOption === "View Segment Video" && <SegmentVideo segment={segment} segmentId={short.segment_id} continueButton={() => {setSelectedOption("Preview Clipped Video")}} /> }
      { selectedOption === "Preview Clipped Video" && <PreviewShortVideo short={short} shortId={shortId} continueButton={(()=>{setTab("Transcript Editor")})}/> }
      { selectedOption === "Saliency" && <SaliencyVideo short={short} shortId={shortId} /> }
      { selectedOption === "Bounding Box Suggestions" && <BoundingBoxSuggestions short={short} shortId={shortId} /> }

    </div>
  );
}