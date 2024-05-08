import React, {useEffect, useState} from "react";
import {ModalLayout} from "../layouts/ModalLayout";
import {useSearchParams} from "react-router-dom";
import {documentToUserVideo, UserVideo} from "../types/collections/UserVideo";
import FirebaseDatabaseService from "../services/database/strategies/FirebaseFirestoreService";
import {useNotificaiton} from "../contexts/NotificationProvider";
import Proposals from "../assets/icons/Email Open.svg";
import Transcript from "../assets/icons/Transcript.svg"
import Segments from "../assets/icons/Image.svg";
import ThumbsUp from "../assets/icons/Thumbs Up.svg";


export interface VideoProgressProps {

}

export const VideoProgress: React.FC<VideoProgressProps> = ({}) => {
    const [searchParams, _] = useSearchParams();
    const video_id = searchParams.get("video_id");

    const [video, setVideo] = useState<UserVideo>();
    const {showNotification} = useNotificaiton();

    useEffect(() => {
        if (video_id){
            FirebaseDatabaseService.getDocument('videos', video_id, (document) => {
                showNotification("Document Collection", "Retrieved document from database", "success", 5000)
                if (document) {
                    setVideo(documentToUserVideo(document));
                }
            }, () => {
                showNotification("Document Collection", "Failed to get the document", "error", 5000);
            })

            FirebaseDatabaseService.listenToDocument("videos", video_id, (document)=>{
                    if (document) {
                        setVideo(documentToUserVideo(document));
                    }
            },
                ()=>{showNotification("Adding Listener", "Failed to add event listener to document", "error", 10000)})

        }
    }, []);

    useEffect(() => {
        if (video && (video.status === "Preprocessing Complete" || video.status === "Clip Transcripts")) {
            window.location.href = `/video-temporal-segmentation?video_id=${video_id}`
        }
    }, [video, video_id]);

    return <ModalLayout>
        {video && <div className={"min-w-[300px] min-h-[300px] w-[50vw] h-[50vh] bg-background rounded-xl flex flex-col justify-center items-center gap-10 text-white"}>
            {
                video.status === "Uploaded" ? <img className={"animate-spin"} src={Transcript} alt={"Uploaded video"} /> :
                video.status === "Transcribing" ? <img className={"animate-spin"} src={Transcript} alt={"Uploaded video"} /> :
                video.status === "Diarizing" ? <img className={"animate-spin"} src={Transcript} alt={"Uploaded video"} /> :
                video.status === "Segmenting" ? <img className={"animate-bounce"} src={Segments} alt={"Uploaded video"} /> :
                video.status === "Summarizing Segments" ? <img className={"animate-bounce"} src={Proposals} alt={"Summarising Segments"} /> :
                video.status === "Preprocessing Complete" ? <img className={"animate-bounce"} src={ThumbsUp} alt={"Process Complete"} /> :
                    <img src={ThumbsUp} alt={"Unsure what's going on "} />
            }


            <div className={"flex flex-col justify-center items-center"}>
                {
                    video.status === "Uploaded" ? <p className={"text-white font-bold text-subsubtitle"}> Video Uploaded! </p> :
                    video.status === "Transcribing" ? <p className={"text-white font-bold text-subsubtitle"}> Transcribing the Video </p> :
                    // video.status === "Diarizing" ? <p className={"text-white font-bold text-subsubtitle"}> Video Uploaded! </p> :
                    video.status === "Segmenting" ? <p className={"text-white font-bold text-subsubtitle"}> Segmenting Video </p> :
                    video.status === "Summarizing Segments" ? <p className={"text-white font-bold text-subsubtitle"}> Summarizing Segments </p> :
                    video.status === "Preprocessing Complete" ? <p className={"text-white font-bold text-subsubtitle"}> Preprocessing Complete!  </p> :
                        <p className={"text-white font-bold text-subsubtitle"}>I have no clue what's going on...</p>
                }
                <p>{video.progressMessage}</p>
            </div>

            {
                <div className={"w-[300px] outline outline-primary rounded-full h-2 bg-secondary"}>
                    <div className={"bg-accent h-2 rounded-full transition-all"} style={{width: `${video.processingProgress}%`}}></div>
                </div>
            }

            <div className={"text-center"}>
                {video.processingProgress !== 0 && <p>{`${video.processingProgress.toFixed(2)}%`}</p>}
                {video.queuePosition !== -1 && <p className={"text-danger"}>You are positioned {video.queuePosition} in the queue..</p>}
            </div>

        </div>}
    </ModalLayout>
}