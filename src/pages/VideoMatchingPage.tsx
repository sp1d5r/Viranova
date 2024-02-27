import React, {useEffect, useState} from 'react';
import ScrollableLayout from "../layouts/ScrollableLayout";
import Background from "../assets/landing-page-assets/background.png";
import {getVideoInfo} from "../services/youtube";
import {Video} from "../types/Video";
import {useNotificaiton} from "../contexts/NotificationProvider";

export interface VideoMatchingPageProps {
    //
}

export const VideoMatchingPage : React.FC<VideoMatchingPageProps> = () => {

    const [videoPair, setVideoPair] = useState({
        'id': '',
        'short_video_id': '',
        'long_video_id': '',
        'prediction_true': 0.9,
        'prediction_false': 0.6
    })

    const [shortVideo, setShortVideo] = useState<Video>();
    const [longVideo, setLongVideo] = useState<Video>();

    const {showNotification} = useNotificaiton();


    useEffect(() => {
        const short_video_id = videoPair.short_video_id;
        const long_video_id = videoPair.long_video_id;

        if (short_video_id != "") {
            getVideoInfo(short_video_id).then((res) => {
                if (res) {
                    setShortVideo(res);
                } else {
                    showNotification('Video Collection', 'Unable to get the YouTube Short', 'error', 5000)
                }
            })
        }

        if (long_video_id != "") {
            getVideoInfo(long_video_id).then((res) => {
                if (res) {
                    setLongVideo(res);
                } else {
                    showNotification('Video Collection', 'Unable to get the original video', 'error', 5000)
                }
            })
        }

    }, [videoPair]);


    return <ScrollableLayout>
        <img onMouseDown={() => {return;}} className={"absolute z-0 top-10  opacity-75"} src={Background} alt={""}/>
        <div className={"z-10 relative container text-white"}>
            <h1 className={"text-title"}>Do these Videos Match</h1>
            <span className={"text-white"}><a href={"https://en.wikipedia.org/wiki/Self-supervised_learning"} className={"text-primary font-bold hover:underline"}>Self-Supervised Learning</a> is the next best thing... But I don’t have people to help - whenever you’re bored just come in and let me know if this is
right or wrong. </span>

            <div className={"flex gap-20 justify-center py-5"}>

                <div className={"flex flex-col  justify-evenly items-center gap-2 min-w-[200px] min-h-[400px] bg-white/5 hover:bg-white/10 rounded-xl backdrop-blur-sm"}>
                    <img className={"w-[80%]"} src={shortVideo ? shortVideo.thumbnailUrl :"https://placehold.jp/300x150.png"} alt={"something "} />

                    <div className={"flex flex-col gap-1 items-start w-[80%]"}>
                        <p className={"font-light text-gray-400"}>Video Title</p>
                        <p className={"text-white"}>{shortVideo ? shortVideo.videoTitle: "Unknown Video"}</p>
                    </div>

                    <div className={"flex flex-col gap-1 items-start w-[80%]"}>
                        <p className={"font-light text-gray-400"}>Video Description</p>
                        <p className={"text-white"}>{shortVideo ? shortVideo.videoDescription: "Unknown Video"}</p>
                    </div>

                    <a href={shortVideo ? shortVideo.videoTitle : "/"} className={"font-bold hover:underline"} >Go to Video</a>
                </div>

                <div className={"flex flex-col  justify-evenly items-center gap-2 min-w-[200px] min-h-[400px] bg-white/5 hover:bg-white/10 rounded-xl backdrop-blur-sm"}>
                    <img className={"w-[80%]"} src={shortVideo ? shortVideo.thumbnailUrl :"https://placehold.jp/300x150.png"} alt={"something "} />

                    <div className={"flex flex-col gap-1 items-start w-[80%]"}>
                        <p className={"font-light text-gray-400"}>Video Title</p>
                        <p className={"text-white"}>{shortVideo ? shortVideo.videoTitle: "Unknown Video"}</p>
                    </div>

                    <div className={"flex flex-col gap-1 items-start w-[80%]"}>
                        <p className={"font-light text-gray-400"}>Video Description</p>
                        <p className={"text-white"}>{shortVideo ? shortVideo.videoDescription: "Unknown Video"}</p>
                    </div>

                    <a href={shortVideo ? shortVideo.videoTitle : "/"} className={"font-bold hover:underline"} >Go to Video</a>
                </div>

                <div className={"flex flex-col justify-center gap-2"}>
                    <button className={"w-[200px] bg-red-400/10 hover:bg-red-400/30 px-5 py-2 rounded border border-white"}>
                        <p className={"font-bold hover:underline"}>Fuck Off</p>
                    </button>
                    <button className={"w-[200px] bg-blue-400/10 hover:bg-blue-400/30 px-5 py-2 rounded border border-white"}>
                        <p className={"font-bold hover:underline"}>Skip Video</p>
                    </button>
                    <button className={"w-[200px] bg-green-400/10 hover:bg-green-400/30 px-5 py-2 rounded border border-white"}>
                        <p className={"font-bold hover:underline"}>Correct Pair</p>
                    </button>

                    <div className={"flex gap-2"}>
                        <div className={"relative w-full h-5 bg-white/20"}>
                            <div className={"relative  top-0 left-0 h-5 bg-green-400/20"} style={{width: `${videoPair.prediction_true * 100}%`}}>
                            </div>
                        </div>
                        <p>{videoPair.prediction_true}</p>
                    </div>

                    <div className={"flex gap-2"}>
                        <div className={"relative w-full h-5 bg-white/20"}>
                            <div className={"relative  top-0 left-0 h-5 bg-red-400/20"} style={{width: `${videoPair.prediction_false * 100}%`}}>
                            </div>
                        </div>
                        <p>{videoPair.prediction_false}</p>
                    </div>

                    <form className={"flex  flex-col gap-2"} onSubmit={(e) => {
                        e.preventDefault(); // Prevents the default form submission behavior
                        showNotification('Updated Collection', 'Collection Updated', 'success', 5000);
                    }}>
                        <div className={"flex flex-col gap-2"}>
                            <label>
                                <p>Start Time</p>
                                <input className={"text-gray-400"} type="time" name="start_time" />
                            </label>
                        </div>
                        <div className={"flex flex-col gap-2"}>
                            <label>
                                <p>End Time</p>
                                <input className={"text-gray-400"} type="time" name="start_time" />
                            </label>
                        </div>
                        <input type="submit" value="Submit"/>
                    </form>
                </div>
            </div>
        </div>

    </ScrollableLayout>
}