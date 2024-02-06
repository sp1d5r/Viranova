import React from "react";
import {Video, ProposedVideo} from "../types/Video";

export interface ReviewVideoProps {
    youtubeShort: Video;
    proposedYoutubeVideos: ProposedVideo[];
    selectOption: (option: number) => void;
    skip: () => void;
}

export const ReviewVideo: React.FC<ReviewVideoProps> = ({youtubeShort, proposedYoutubeVideos, selectOption, skip}) => {
    return <div className={"flex-wrap sm:flex-no-wrap flex w-full h-[90%] gap-5"}>
        <div className={"flex-1 text-accent border border-accent rounded h-full flex flex-col gap-2 p-2"}>
            <h2 className={"text-subtitle"}> Youtube Shorts</h2>
            <a className={"text-bold underline"} href={youtubeShort.videoUrl}>{youtubeShort.videoTitle}</a>
            <p>{youtubeShort.videoDescription}</p>
            <img src={youtubeShort.thumbnailUrl} alt={"Youtube Short"} />
            <div className={"flex w-full h-20 justify-evenly"}>
                {proposedYoutubeVideos.map((proposedVideo, index) => {
                    return <button className={"bg-blue-200 text-black px-5 rounded"} key={index} onClick={()=>{selectOption(proposedVideo.order)}}>
                        {proposedVideo.order}
                    </button>
                })}

                <button className={"bg-red-400 text-black px-5 rounded"} onClick={() => {skip()}}>
                    Skip
                </button>

            </div>
        </div>
        <div className={"flex-1 h-full flex flex-col justify-evenly gap-5"}>
            {
                proposedYoutubeVideos.sort((a, b) => {
                    if (a.order < b.order) {
                        return -1;
                    }
                    if (a.order > b.order) {
                        return 1;
                    }
                    return 0;
                }).map((value, index) => {
                    const video = value.video;

                    return <div key={index} className={"text-accent flex justify-between border border-accent rounded flex-1 items-center p-2"}>
                        <img className={"h-[100px]"} src={video.thumbnailUrl} alt={"Youtube Short"} />
                        <div className={"flex flex-1 flex-col gap-2 p-2" }>
                            <a className={"text-bold underline"} href={video.videoUrl}>{video.videoTitle}</a>
                            <p>{video.videoDescription}</p>
                        </div>

                        <button className={"bg-green-400 text-black px-5 rounded"} onClick={() => {selectOption(value.order)}}>
                            Link
                        </button>
                    </div>
                })
            }
        </div>

    </div>;
}