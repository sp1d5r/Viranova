import React, {useEffect, useState} from "react";
import {PageState} from "../../pages/SegmentationHandlingPage";
import {SegmentationGroup} from "../../types/segmentation-masks/SegmentationGroup";
import {VideoCard} from "../cards/video-card/VideoCard";
import Starting from "../../assets/segmentation-assets/starting.svg";
import Loading from "../../assets/segmentation-assets/loading.svg";
import Confirm from "../../assets/segmentation-assets/confirm.svg";
import GoodLuck from "../../assets/segmentation-assets/good_luck.svg";
import {Video} from "../../types/Video";
import {getVideoInfo} from "../../services/youtube";
import {useNotification} from "../../contexts/NotificationProvider";

export interface SegmentationIntroProps {
    setPageState: (pageState: PageState) => void;
    videoFile: string;
    getNewVideoFile: () => void;
    getSegmentationGroup: () => void;
    segmentationGroup: SegmentationGroup;
}


type SegmentationIntroStates = "STARTING" | "CONFIRMATION" | "LOADING" | "COMPLETE"

export const SegmentationIntro : React.FC<SegmentationIntroProps> = ({setPageState, videoFile, getNewVideoFile, getSegmentationGroup, segmentationGroup}) => {
    const [segmentationState, setSegmentationState] = useState<SegmentationIntroStates>("STARTING");
    const [video, setVideo] = useState<Video | undefined>(undefined);
    const [loadingSegmentation, setLoadingSegment] = useState(false);
    const {showNotification} = useNotification();

    useEffect(() => {
        setLoadingSegment(segmentationGroup.spacialGroups.length !== 0 );
        if (segmentationGroup.spacialGroups.length !== 0) {
            setSegmentationState("COMPLETE");
        }
    }, [segmentationGroup]);

    useEffect(() => {
        const videoId : string = videoFile.split(".")[0];
        getVideoInfo(videoId).then((res) => {
            if (res) {
                setVideo(res);
            } else {
                showNotification('Video Collection', 'Unable to get the YouTube.', 'error', 5000)
            }
        })
    }, [videoFile]);

    return <div className={"text-white flex flex-col justify-center items-center gap-5 py-5"}>
        <div className={" flex justify-center items-center flex-col text-center"}>
            <h1 className={"text-title"}>Track the pesky segment!</h1>
            <span>
                <a href={"https://en.wikipedia.org/wiki/Self-supervised_learning"} className={"text-primary font-bold hover:underline"}>Self-Supervised Learning </a>
                is the foundation for high performing models... But I don’t have people to help - Merge and Track segments across frames and across time.</span>
        </div>

        <div className={"flex gap-10 justify-center items-center"}>
            <div className={"flex flex-col h-full gap-10 justify-center items-center"}>
                <div className={"flex flex-col justify-center items-center w-64 h-40 border border-primary rounded-xl"}>
                    {
                        segmentationState == "STARTING" ?
                            <img src={Starting} alt={"Starting"}/> :
                        segmentationState == "CONFIRMATION" ?
                            <img src={Confirm} alt={"Starting"}/> :
                        segmentationState == "LOADING" ?
                            <><img className={"animate-bounce"} src={Loading} alt={"Starting"}/> <p>(This might take a sec)</p></>:
                        segmentationState == "COMPLETE" ?
                            <img src={GoodLuck} alt={"Starting"}/> :
                        <img src={Starting} alt={"Starting"}/>
                    }
                </div>

                {
                    segmentationState=="STARTING" ?
                        <div className={"flex flex-col gap-5"}>
                            <button
                                onClick={() => {
                                    if (!loadingSegmentation) {
                                        setLoadingSegment(true);
                                        getNewVideoFile();
                                        setLoadingSegment(false);
                                        setSegmentationState("CONFIRMATION")
                                    } else {
                                        console.log("Failed")
                                    }
                                }}
                                className={"w-[200px] bg-green-400/10 hover:bg-green-400/30 px-5 py-2 rounded border border-white"}>
                                <p className={"font-bold hover:underline"}>Roll The Dice</p>
                            </button>

                            <button
                                disabled
                                onClick={() => {}}
                                className={"w-[200px] bg-blue-400/10 px-5 py-2 rounded border border-gray-400"}>
                                <p className={"text-gray-400 font-bold"}>Extract Segment</p>
                            </button>
                        </div> :
                    segmentationState=="CONFIRMATION" ?
                        <div className={"flex flex-col gap-5"}>
                            <button
                                onClick={() => {
                                    if (!loadingSegmentation) {
                                        setLoadingSegment(true);
                                        getSegmentationGroup()
                                        setSegmentationState("LOADING");
                                    }
                                }}
                                className={"w-[200px] bg-blue-400/10 hover:bg-blue-400/30 px-5 py-2 rounded border border-white"}>
                                <p className={"font-bold hover:underline"}>Extract Segment</p>
                            </button>

                            <button
                                onClick={() => {
                                    if (!loadingSegmentation) {
                                        setLoadingSegment(true);
                                        getNewVideoFile();
                                        setLoadingSegment(false);
                                        setSegmentationState("CONFIRMATION")
                                    } else {
                                        console.log("Failed")
                                    }
                                }}
                                className={"w-[200px] bg-red-400/10 hover:bg-red-400/30 px-5 py-2 rounded border border-white"}>
                                <p className={"font-bold hover:underline"}>Re-roll...</p>
                            </button>
                        </div> :
                    segmentationState=="LOADING" ?
                        <div className={"flex flex-col gap-5"}>
                            <button
                                disabled
                                onClick={() => {}}
                                className={"w-[200px] bg-blue-400/10 px-5 py-2 rounded border border-gray-400"}>
                                <p className={"font-bold text-gray-400"}>Extract Segment</p>
                            </button>

                            <button
                                disabled
                                onClick={() => {}}
                                className={"w-[200px] bg-red-400/10 px-5 py-2 rounded border border-gray-400"}>
                                <p className={"text-gray-400 font-bold"}>Re-roll...</p>
                            </button>
                        </div> :
                    segmentationState=="COMPLETE" ?
                            <div className={"flex flex-col gap-5"}>
                                <button
                                    onClick={() => {
                                        setPageState("SpacialSegmentation");
                                    }}
                                    className={"w-[200px] bg-green-400/10 hover:bg-green-400/30 px-5 py-2 rounded border border-white"}>
                                    <p className={"font-bold hover:underline"}>Begin Segmentation</p>
                                </button>

                                <button
                                    onClick={() => {
                                        window.location.reload()
                                    }}
                                    className={"w-[200px] bg-red-400/10 hover:bg-red-400/30 px-5 py-2 rounded border border-white"}>
                                    <p className={"font-bold hover:underline"}>Re-roll...</p>
                                </button>
                            </div>:
                        <></>
                }

            </div>

            {
                video &&  <VideoCard video={video} className={"max-w-[400px]"}/>
            }

        </div>
    </div>
}