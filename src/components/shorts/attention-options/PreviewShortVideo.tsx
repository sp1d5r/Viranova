import React from "react";
import {VideoPlayer} from "../../video-player/VideoPlayer";
import {Short} from "../../../types/collections/Shorts";

export interface PreviewShortVideoProps {
  short: Short;
  continueButton: ()=>void;
}

export const PreviewShortVideo : React.FC<PreviewShortVideoProps> = ({short, continueButton}) => {

  return <div className="w-full flex flex-col gap-2 items-center">
    <VideoPlayer path={short.short_clipped_video} />
    {/* */}

    <div className="inline-flex rounded-md shadow-sm" role="group">
      <button type="button" className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
        Clip Short Video
      </button>
      <button onClick={() => {continueButton()}} type="button" className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
        Re-Adjust Transcript
      </button>
    </div>

  </div>
}