import React, {useEffect, useState} from "react";
import {ModalLayout} from "../layouts/ModalLayout";
import {useSearchParams} from "react-router-dom";
import {documentToUserVideo, UserVideo} from "../types/collections/UserVideo";
import FirebaseDatabaseService from "../services/database/strategies/FirebaseFirestoreService";
import {useNotification} from "../contexts/NotificationProvider";
import Proposals from "../assets/icons/Email Open.svg";
import Transcript from "../assets/icons/Transcript.svg"
import Segments from "../assets/icons/Image.svg";
import ThumbsUp from "../assets/icons/Thumbs Up.svg";
import {LoadingIcon} from "../components/loading/Loading";
import {Button} from "../components/ui/button";
import {ChevronsLeft} from "lucide-react";


export interface VideoProgressProps {

}

export const VideoProgress: React.FC<VideoProgressProps> = ({}) => {
    const [searchParams, _] = useSearchParams();
    const video_id = searchParams.get("video_id");

    const [video, setVideo] = useState<UserVideo>();
    const {showNotification} = useNotification();

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
        if (video && (video.status === "Preprocessing Complete" || video.status === "Clip Transcripts" || video.status === "Create TikTok Ideas")) {
            window.location.href = `/video-temporal-segmentation?video_id=${video_id}`
        }
    }, [video, video_id]);

    return <ModalLayout>
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-emerald-400 to-emerald-700 transform scale-[0.50] bg-primary rounded-xl blur-3xl" />

        <div className="absolute top-0 left-0 w-100vw py-2 px-4">
            <a href="/dashboard">
                <Button variant="outline">
                    <ChevronsLeft color="#ffffff" />
                </Button>
            </a>
        </div>

        <div className={"relative min-w-[300px] min-h-[300px] w-[50vw] h-[50vh] bg-background rounded-xl flex flex-col justify-center items-center gap-10 text-white border border-primary overflow-hidden p-2"}>

            {video ? (
              <>
            <div className={"flex flex-col justify-center items-center text-center"}>
                {
                    video.status === "Uploaded" ? <img className={"animate-spin"} src={Transcript} alt={"Uploaded video"} /> :
                      video.status === "Link Provided" ? <img className={"animate-spin"} src={Transcript} alt={"Uploaded video"} /> :
                        video.status === "Transcribe" ? <img className={"animate-spin"} src={Transcript} alt={"Uploaded video"} /> :
                          video.status === "Diarizing" ? <img className={"animate-spin"} src={Transcript} alt={"Uploaded video"} /> :
                            video.status === "Segmenting" ? <img className={"animate-bounce"} src={Segments} alt={"Uploaded video"} /> :
                              video.status === "Summarizing Segments" ? <img className={"animate-bounce"} src={Proposals} alt={"Summarising Segments"} /> :
                                video.status === "Preprocessing Complete" ? <img className={"animate-bounce"} src={ThumbsUp} alt={"Process Complete"} /> :
                                  <img src={ThumbsUp} alt={"Unsure what's going on "} />
                }
                {
                    video.status === "Uploaded" ? <p className={"text-white font-bold text-subsubtitle"}> Video Uploaded! </p> :
                    video.status === "Transcribe" ? <p className={"text-white font-bold text-subsubtitle"}> Transcribing the Video </p> :
                    video.status === "Link Provided" ? <p className={"text-white font-bold text-subsubtitle"}> Downloading Youtube </p> :
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

            <span className="text-sm text-gray-300 text-center">
                Feel free to continue working, we will email you when we're ready for the next step.
                <br/>
                If you are stuck here, contact support <a className="text-primary underline">elijahahmad03@gmail.com</a>
            </span>
          </>
              ) :
              <LoadingIcon id={"video-progress"} text={"Loading Video Type"} />
            }

        </div>
    </ModalLayout>
}