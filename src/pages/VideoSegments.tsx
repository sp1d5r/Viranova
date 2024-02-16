import React, {useEffect, useState} from 'react';
import ScrollableLayout from "../layouts/ScrollableLayout";
import {useSearchParams} from "react-router-dom";
import {documentToUserVideo, UserVideo} from "../types/collections/UserVideo";
import {useNotificaiton} from "../contexts/NotificationProvider";
import FirebaseDatabaseService from "../services/database/strategies/FirebaseFirestoreService";
import firebaseFirestoreService from "../services/database/strategies/FirebaseFirestoreService";
import {documentToTranscript, Transcript} from "../types/collections/Transcript";
import {documentToSegment, Segment} from "../types/collections/Segment";

export interface VideoSegmentsProps {
    //
}

export const VideoSegments: React.FC<VideoSegmentsProps> = ({}) => {
    const [searchParams, _] = useSearchParams();
    const video_id = searchParams.get("video_id");

    const [video, setVideo] = useState<UserVideo>();
    const [transcripts, setTranscripts] = useState<Transcript[]>();
    const [segments, setSegments] = useState<Segment[]>();
    const [selectedSegment, setSelectedSegment] = useState(-1);

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
    }, [video_id]);

    useEffect(() => {
        if (video && video_id) {
            showNotification("Retrieving Transcript", "Accessing the Transcripts", "info", 5000);
            firebaseFirestoreService.queryDocuments(
                "transcriptions",
                "video_id",
                video_id,
                "index",
                (transcript) => {
                    setTranscripts(transcript.map((transcript) => {
                        return documentToTranscript(transcript);
                    }));
                    console.log(transcripts);
                },
                (err) => {
                    console.log(err)
                    showNotification("Transcript Error", "Failed to get transcript", "error", 5000)
                }
            );
            firebaseFirestoreService.queryDocuments(
                "topical_segments",
                "video_id",
                video_id,
                "index",
                (segments) => {
                    setSegments(segments.map((segment) => {
                        return documentToSegment(segment);
                    }));
                },
                (err) => {
                    console.log(err)
                    showNotification("Segments Error", "Failed to get segments", "error", 5000)
                }
            )
            showNotification("Retrieving Segments", "Accessing the Segments", "info", 5000);

        }
    }, [video, video_id]);

    return <ScrollableLayout>
        <div className={"container text-white"}>
            <h1 className={"text-title "}>Select Segment</h1>
            <p>We've extracted some topical segments to focus in on. Pick one that you'd like to generate clips around.</p>
            <p>We do this to allow our systems to run without distraction</p>

            <div className={"flex flex-col gap-5 pt-10"}>
                {
                    segments && segments.map((elem, index) => {
                        return <div
                            className={`flex flex-col gap-2 border border-accent w-[80%] min-h-36 rounded-xl p-5  hover:bg-green-800
                            ${selectedSegment === index? "bg-green-950" : ""}
                            ${elem.flagged ? "border-danger text-danger": "text-white"}
                            `}
                            key={index}
                            onClick={()=>{
                                if (!elem.flagged) {
                                    setSelectedSegment(index)
                                }
                            }}
                            >
                            {elem.flagged && <div className={"w-full border-b-2 border-danger text-center pb-2 flex gap-2 justify-center"}>
                                <p className={"text-xl font-bold"}>This segment has been flagged for inappropriate content.</p>
                                <button className={"border-danger border"}>Info</button>
                                </div>}
                            <b>Segment {index}</b>
                            <span className={"font-light text-gray-300"}>{new Date(elem.earliestStartTime * 1000).toISOString().slice(11, 19)} - {new Date(elem.latestEndTime * 1000).toISOString().slice(11, 19)} </span>
                            <span><span className={"font-bold"}>Segment Description</span>: {elem.segmentSummary}</span>
                            <span><span className={"font-bold"}>Transcript</span>: {elem.transcript}</span>

                            <div className={"flex gap-2 py-2 items-center"}>
                                <p >Alerts: </p>
                                <div className={elem.harassment ? "border-danger border text-danger rounded" : "border-success border text-success rounded"}> <p className={"px-2 py-1"}> Harassment </p> </div>
                                <div className={elem.harassmentThreatening ? "border-danger border text-danger rounded" : "border-success border text-success rounded"}> <p className={"px-2 py-1"}> Threatening </p> </div>
                                <div className={elem.hate ? "border-danger border text-danger rounded" : "border-success border text-success rounded"}> <p className={"px-2 py-1"}>  Hate </p> </div>
                                <div className={elem.sexual ? "border-danger border text-danger rounded" : "border-success border text-success rounded"}> <p className={"px-2 py-1"}>  Sexual </p> </div>
                                <div className={elem.sexualMinors ? "border-danger border text-danger rounded" : "border-success border text-success rounded"}> <p className={"px-2 py-1"}>  Sexual/Minors </p> </div>
                                <div className={elem.selfHarm ? "border-danger border text-danger rounded" : "border-success border text-success rounded"}> <p className={"px-2 py-1"}>  Self Harm </p> </div>
                                <div className={elem.selfHarmIntent ? "border-danger border text-danger rounded" : "border-success border text-success rounded"}> <p className={"px-2 py-1"}>  Self Harm Intent </p> </div>
                            </div>
                        </div>
                    })
                }

                {/*{ transcripts && transcripts.map((elem, index) => {*/}
                {/*    return <div key={index}>*/}
                {/*        <p>{elem.videoId}</p>*/}
                {/*    </div>*/}
                {/*    })*/}
                {/*}*/}
            </div>


        </div>
        <div className={"backdrop-blur w-full sticky bottom-0 h-20 border-t-2 border-accent "}>
            <div className={"container h-full flex flex-row-reverse justify-between items-center p-2 text-white"}>
                <button className={"rounded border-primary text-primary border-2 px-5 py-2 hover:bg-primary hover:text-background"}>Continue</button>
                <p className={"text-bold text-white"}>Step 1/5 : Select the segments</p>
            </div>

        </div>

    </ScrollableLayout>
}