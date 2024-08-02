import React from "react";
import {VideoPlayer} from "../../video-player/VideoPlayer";
import {Short} from "../../../types/collections/Shorts";
import {useNotification} from "../../../contexts/NotificationProvider";
import FirebaseFirestoreService from "../../../services/database/strategies/FirebaseFirestoreService";

export interface SaliencyVideoProps {
  short: Short;
  shortId: string;
}

export const SaliencyVideo: React.FC<SaliencyVideoProps> = ({short, shortId}) => {
  const { showNotification } = useNotification();

  return <div className="w-full flex flex-col gap-2 items-center">
    <VideoPlayer path={short.short_video_saliency} loadingText={"Loading Saliency"}/>
    {/* */}

    <div className="inline-flex rounded-md shadow-sm" role="group">
      <button
        type="button"
        className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
        onClick={() => {
          FirebaseFirestoreService.updateDocument(
            "shorts",
            shortId,
            {
              short_status: "Generate Saliency",
              previous_short_status: "Requested Generate Saliency"
            },
            () => {
              showNotification("Success", "Requested to generate saliency", "success")
            },
            (error) => {
              showNotification("Failed", error.message, "error")
            }
          )
        }}
      >
        Regenerate Saliency
      </button>
      <button type="button" className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
        Switch Saliency Type...
      </button>
    </div>

  </div>
}