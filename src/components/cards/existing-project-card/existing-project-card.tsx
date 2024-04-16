import React from "react";
export interface ExistingProjectCardProps {
    backgroundImage: string;
    title: string;
    date: string;
    videoId: string;
}

export const ExistingProjectCard: React.FC<ExistingProjectCardProps> = ({backgroundImage, date, title, videoId}) => {
    return <div onClick={() => {window.location.href=`/video-handler?video_id=${videoId}`}} className={"m-auto border-accent border flex flex-col relative overflow-hidden rounded-xl border-accent w-[100%] max-w-[400px] h-[50vh] items-end justify-end bg-gradient-to-r from-green-500 to-emerald-900 hover:scale-105 transition-all"}>
        <img
            src={backgroundImage}
            alt={"Oh no load failed bg-gradient-to-r from-green-500 to-emerald-900"}
            className={"z-0 w-full h-full absolute object-cover "}
        />

        <div className={"z-10 h-full w-full bg-gradient-to-b from-transparent to-black"}/>
        <div className={"relative bg-black z-10 w-full min-h-[30%] text-white flex flex-col p-5 gap-2"}>
            <p className={"font-bold"}>{title}</p>
            <p>{date}</p>
        </div>
    </div>
}