import React from 'react';
import {Video} from "../../../types/Video";

export interface VideoCardProps {
    video: Video;
    className?: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({video, className=""}) => {
    return <div className={`flex flex-col py-5 flex-1  justify-evenly items-center gap-2 min-w-[200px] min-h-[400px] bg-white/5 hover:bg-white/10 rounded-xl backdrop-blur-sm ${className}`}>
        <img className={"max-h-[200px] object-cover"} src={video ? video.thumbnailUrl :"https://placehold.jp/300x150.png"} alt={"something "} />

        <div className={"flex flex-col gap-1 items-start w-[80%]"}>
            <p className={"font-light text-gray-400"}>Video Title</p>
            <p className={"text-white"}>{video ? video.videoTitle: "Unknown Video"}</p>
        </div>

        <div className={"flex flex-col gap-1 items-start w-[80%]"}>
            <p className={"font-light text-gray-400"}>Video Description</p>
            <p className={"text-white"}>{video ? video.videoDescription.substring(0, 100): "Unknown Video"}</p>
        </div>

        <a href={video ? video.videoUrl : "/"} target="_blank" rel="noopener noreferrer" className={"font-bold hover:underline"} >Go to Video</a>
    </div>;
}