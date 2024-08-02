import React from "react";
import {VideoPlayer} from "../../video-player/VideoPlayer";
import {Short} from "../../../types/collections/Shorts";
import FirebaseFirestoreService from "../../../services/database/strategies/FirebaseFirestoreService";
import {useNotification} from "../../../contexts/NotificationProvider";

export interface PreviewShortVideoProps {
  short: Short;
  shortId: string;
  continueButton: ()=>void;
}

export const PreviewShortVideo : React.FC<PreviewShortVideoProps> = ({short, shortId, continueButton}) => {

  const {showNotification} = useNotification();

  return <div className="w-full flex flex-col gap-2 items-center">
    <VideoPlayer path={short.short_clipped_video} />
    {/* */}

    <div className="inline-flex rounded-md shadow-sm" role="group">
      <button
        type="button"
        onClick={() => {
          FirebaseFirestoreService.updateDocument(
            "shorts",
            shortId,
            {
              "short_status": "Create Short Video",
              "previous_short_status": "Requested to Create Short"
            },
            () => {showNotification("Success", "Requested to create short video.", "success")},
            (error) => {showNotification("Failed", error.message, "error")},
          )
        }}
        className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
        Clip Short Video
      </button>
      <button onClick={() => {continueButton()}} type="button" className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
        Re-Adjust Transcript
      </button>
    </div>

  </div>
}