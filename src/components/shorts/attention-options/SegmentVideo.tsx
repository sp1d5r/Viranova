import React from "react";
import {Segment} from "../../../types/collections/Segment";
import {VideoPlayer} from "../../video-player/VideoPlayer";
import FirebaseFirestoreService from "../../../services/database/strategies/FirebaseFirestoreService";
import {useNotificaiton} from "../../../contexts/NotificationProvider";

export interface SegmentVideoProps {
  segment: Segment;
  segmentId: string;
  continueButton: ()=>void;
}

export const SegmentVideo: React.FC<SegmentVideoProps> = ({segment, segmentId, continueButton}) => {

  const {showNotification} = useNotificaiton();

  return <div className="w-full flex flex-col gap-2 items-center justify-start">
    <VideoPlayer path={segment.videoSegmentLocation} />

    <div className="inline-flex rounded-md shadow-sm" role="group">
      <button
        onClick={() => {
          FirebaseFirestoreService.updateDocument(
            "topical_segments",
            segmentId,
            {
              "segment_status": 'Crop Segment',
              "previous_segment_status": 'Beginning Crop Segment'
            },
            () => {
              showNotification("Success", "Begining Segment Cropping", "success");
            },
            (error) => {
              showNotification("Failed", error.message, "error");
            }
            )
        }}
        type="button"
        className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
      >
        Regenerate Segment Video
      </button>
      <button
        onClick={()=>{continueButton()}}
        type="button"
        className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
        Continue
      </button>
    </div>

  </div>
}