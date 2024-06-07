import React, {useState} from "react";
import {Short} from "../../../types/collections/Shorts";
import {VideoPlayer} from "../../video-player/VideoPlayer";
import {LoadingIcon} from "../../loading/Loading";

export interface ExistingShortCardProps {
  short: Short;
}

export const ExistingShortCard: React.FC<ExistingShortCardProps> = ({short}) => {
  const [previewVideo, setPreviewVideo] = useState(false);
  return <div className="max-w-sm border  rounded-lg shadow bg-gray-800 border-gray-700 overflow-hidden">
    {short.finished_short_location && previewVideo ? <VideoPlayer path={short.finished_short_location}  /> : <div className="w-full flex flex-col bg-black py-4 justify-center items-center">
      <LoadingIcon className="h-35 w-full bg-black py-10" id={short.id.toString()} text={""}/>
      <button
        type="button"
        className="inline-flex items-center px-4 py-2 my-2 text-sm font-medium border rounded-lg focus:z-10 focus:ring-4 focus:outline-none focus:text-emerald-700 bg-gray-800 text-gray-200 border-emerald-600 hover:text-white hover:bg-emerald-700 focus:ring-emerald-700 gap-3"
        onClick={() => {
          setPreviewVideo(true);
        }}
      >
        Preview
      </button>
    </div>
    }

    <div className="p-5">
      <div>
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">{short.short_idea}</h5>
        <div className="p-4 mb-4 text-sm text-green-500 rounded-lg bg-gray-900" role="alert">
          <span className="font-medium">{short.progress_message}</span> {short.update_progress}%
        </div>
      </div>
      {short.last_updated && <p className="mb-3 font-normal text-gray-400">{short.last_updated.toDate().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) + ' ' + short.last_updated.toDate().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}</p>}
      {short.tiktok_link && <a href={short.tiktok_link} className="mb-3 font-normal text-primary underline">Open link</a>}
      <p className="mb-3 font-normal text-gray-400">{short.short_idea_explanation}</p>
      <div className="flex gap-2">
        <a href={`/shorts?short_id=${short.id}`} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white  rounded-lg focus:ring-4 focus:outline-none bg-green-600 hover:bg-green-700 focus:ring-green-800">
          Open Project
          <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
          </svg>
        </a>
        <button  onClick={() => {console.log(short)}} type="button" className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 ">
          <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
          </svg>
          <span className="sr-only">Delete</span>
        </button>
      </div>

    </div>
  </div>
}