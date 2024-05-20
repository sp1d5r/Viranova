import React, {useState} from "react";
import {Short} from "../../types/collections/Shorts";
import FirebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import {useNotificaiton} from "../../contexts/NotificationProvider";
import {VideoPlayer} from "../video-player/VideoPlayer";
import {LoadingIcon} from "../loading/Loading";

export interface ExportTabProps {
  short: Short;
  shortId: string;
}

export const ExportTab :React.FC<ExportTabProps> = ({short, shortId}) => {
  const {showNotification} = useNotificaiton();

  return <div className="text-medium text-gray-400 bg-gray-900 rounded-lg w-full flex justify-evenly flex-wrap gap-5 p-8">
    <div className="flex flex-col flex-1 gap-2 min-w-[200px] py-2">
      <h3 className="text-xl font-bold text-white mb-2">Export Short!</h3>
      <p className="mb-2">We're finally good to go!</p>

      <span>
        This is also where the magic happens, the best next steps you can take is to load the clip into CapCut
        apply additional editing. Try adding captions. Once you've completed that run it through our
        <a href={"/somewhere else"} className="text-primary underline"> clip evaluation </a>
        engine.
      </span>

      <p>
        Alright! Once you've finished editing the video and posting the video add the link to the TikTok produced here:
      </p>

      <div className="mb-6 mt-3">
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          TikTok Link
          <input type="text" id="default-input" className="bg-gray-50 border my-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
        </label>


      </div>

    </div>

    <div className="flex flex-col gap-2 flex-1 min-w-[200px] py-3">
      {short.finished_short_location ?
        <VideoPlayer path={short.finished_short_location} loadingText={"Loading Finished Product"}/>:
        <div className="w-full h-full bg-background rounded-xl flex justify-center items-center">

          <LoadingIcon id={"exporttab"} text={"Video not generated"} className={"min-h-[200px]"}/>
        </div>
      }
      <div className="w-full flex gap-2">
        <button type="button" className="text-white bg-[#050708] hover:bg-[#050708]/80 focus:ring-4 focus:outline-none focus:ring-[#050708]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:hover:bg-[#050708]/40 dark:focus:ring-gray-600 me-2 mb-2 gap-5">
          <svg xmlns="http://www.w3.org/2000/svg"  height="30px" width="30px" viewBox="0 0 192 192" fill="none"><path stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="15" d="M170 42 22 124v14c0 6.627 5.373 12 12 12h78c6.627 0 12-5.373 12-12v-9.5"/><path stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="15" d="M170 150 22 68V54c0-6.627 5.373-12 12-12h78c6.627 0 12 5.373 12 12v9.5"/></svg>
          Export to CapCut
        </button>

        <button
          type="button"
          className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
          disabled={!short.bounding_boxes}
          onClick={() => {
            FirebaseFirestoreService.updateDocument(
              "shorts",
              shortId,
              {
                "short_status": "Preview Video",
                "previous_short_status": "Requested to Preview Video"
              },
              () => {showNotification("Success", "Requested to preview video", "success")},
              (error) => {showNotification("Failed", error.message, "error")},
            )
          }}
        >
          Preview
        </button>
      </div>
    </div>
  </div>
}