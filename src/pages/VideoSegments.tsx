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
                            className={`flex flex-col gap-2 border border-accent w-full min-h-36 rounded-xl p-5
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
                            {elem.flagged &&
                              <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                                  <span className="font-medium">Error!</span> This segment has been flagged for inappropriate content.
                              </div>
                            }
                            <span className="flex gap-5">
                                <span className="font-bold text-2xl">Segment {index}</span>
                                {elem.segmentStatus && <span className="bg-green-100 text-green-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 flex gap-2 items-center">
                                    <div role="status">
                                        <svg aria-hidden="true" className="inline w-2 h-2 text-gray-200 animate-spin dark:text-gray-600 fill-green-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                        </svg>
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                    {elem.segmentStatus}
                                </span>}
                            </span>
                            <span className={"font-light text-gray-300"}>{new Date(elem.earliestStartTime * 1000).toISOString().slice(11, 19)} - {new Date(elem.latestEndTime * 1000).toISOString().slice(11, 19)} </span>
                            <ol className="relative border-s border-gray-200 dark:border-gray-700">
                                <li className="mb-10 ms-4">
                                    <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                                    <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">Segment Transcript Extracted</time>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transcript</h3>
                                    <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">{elem.transcript.substring(0, 400)} ...</p>
                                    <a href="#" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-100 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700">View full transcript
                                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7"/>
                                        </svg>
                                    </a>
                                </li>
                                {elem.segmentSummary && <li className="mb-10 ms-4">
                                    <div
                                      className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                                    <time
                                      className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">Segment
                                        Summarised
                                    </time>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h3>
                                    <p
                                      className="text-base font-normal text-gray-500 dark:text-gray-400">{elem.segmentSummary}</p>
                                </li>}
                                {elem.flagged !== undefined && <li className="ms-4">
                                    <div
                                      className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                                    <time
                                      className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                                        Moderation Completed
                                    </time>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Segment
                                        Moderated</h3>
                                    <div className={"flex gap-2 py-2 items-center"}>
                                        <p>Alerts: </p>
                                        <div
                                          className={elem.harassment ? "border-danger border text-danger rounded" : "border-success border text-success rounded"}>
                                            <p className={"px-2 py-1"}> Harassment </p></div>
                                        <div
                                          className={elem.harassmentThreatening ? "border-danger border text-danger rounded" : "border-success border text-success rounded"}>
                                            <p className={"px-2 py-1"}> Threatening </p></div>
                                        <div
                                          className={elem.hate ? "border-danger border text-danger rounded" : "border-success border text-success rounded"}>
                                            <p className={"px-2 py-1"}> Hate </p></div>
                                        <div
                                          className={elem.sexual ? "border-danger border text-danger rounded" : "border-success border text-success rounded"}>
                                            <p className={"px-2 py-1"}> Sexual </p></div>
                                        <div
                                          className={elem.sexualMinors ? "border-danger border text-danger rounded" : "border-success border text-success rounded"}>
                                            <p className={"px-2 py-1"}> Sexual/Minors </p></div>
                                        <div
                                          className={elem.selfHarm ? "border-danger border text-danger rounded" : "border-success border text-success rounded"}>
                                            <p className={"px-2 py-1"}> Self Harm </p></div>
                                        <div
                                          className={elem.selfHarmIntent ? "border-danger border text-danger rounded" : "border-success border text-success rounded"}>
                                            <p className={"px-2 py-1"}> Self Harm Intent </p></div>
                                    </div>
                                </li>}
                                {elem.shortIdea && <li className="mb-10 ms-4">
                                    <div
                                      className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                                    <time
                                      className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                                        Short Idea Generated
                                    </time>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Short Idea</h3>
                                    <p className="text-base font-normal text-gray-500 dark:text-gray-400 pb-2">
                                        <span className="font-bold">Idea: </span>
                                        {elem.shortIdea}
                                    </p>
                                    <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                                        <span className="font-bold">Justification: </span>
                                        {elem.shortIdeaExplanation}
                                    </p>
                                    <a href="#" className="inline-flex items-center px-4 py-2 my-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-100 focus:text-blue-700 dark:bg-green-800 dark:text-gray-200 dark:border-green-600 dark:hover:text-white dark:hover:bg-green-700 dark:focus:ring-green-700">Generate Short <svg className="w-3 h-3 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                                    </svg></a>
                                </li>}

                            </ol>





                        </div>
                    })
                }

            </div>


        </div>

    </ScrollableLayout>
}