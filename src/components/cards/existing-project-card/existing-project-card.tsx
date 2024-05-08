import React from "react";
import {UserVideo} from "../../../types/collections/UserVideo";
import FirebaseDatabaseService from "../../../services/database/strategies/FirebaseFirestoreService";
import {useNotificaiton} from "../../../contexts/NotificationProvider";
import {FirebaseStorageService} from "../../../services/storage/strategies";
import {LoadingIcon} from "../../loading/Loading";
export interface ExistingProjectCardProps {
    userVideo: UserVideo,
    videoId: string,
    setRefresh: React.Dispatch<React.SetStateAction<boolean>>
    id: number,
}

export const ExistingProjectCard: React.FC<ExistingProjectCardProps> = ({userVideo, videoId, setRefresh, id}) => {
    const {showNotification} = useNotificaiton();

    const deleteVideo = () => {
        FirebaseStorageService.deleteFile(userVideo.videoPath);
        FirebaseDatabaseService.deleteDocument(
          'videos',
          videoId,
          () => {
              showNotification('Deleted Project', 'Deleted Project', 'success', 5000);
              setRefresh(prevState => !prevState);
          },
          () => {}
        )
    }

    return <div className="max-w-sm border  rounded-lg shadow bg-gray-800 border-gray-700 overflow-hidden">
        <LoadingIcon className="h-35 w-full bg-black py-10" id={id.toString()}/>

        <div className="p-5">
            <div>
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">{userVideo.originalFileName}</h5>
                <div className="p-4 mb-4 text-sm text-green-500 rounded-lg bg-gray-900" role="alert">
                    <span className="font-medium">{userVideo.progressMessage}</span> {userVideo.processingProgress}%
                </div>
            </div>
            <p className="mb-3 font-normal text-gray-400">{new Date(userVideo.uploadTimestamp).toString()}</p>
            <p className="mb-3 font-normal text-gray-400">{userVideo.videoPath}</p>
            <div className="flex gap-2">
                <a href={`/video-handler?video_id=${videoId}`} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white  rounded-lg focus:ring-4 focus:outline-none bg-green-600 hover:bg-green-700 focus:ring-green-800">
                    Open Project
                    <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                    </svg>
                </a>
                <button  onClick={() => {deleteVideo()}} type="button" className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 ">
                    <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
                    </svg>
                    <span className="sr-only">Delete</span>
                </button>
            </div>

        </div>
    </div>
}