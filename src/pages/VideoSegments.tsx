import React, {useEffect, useState} from 'react';
import ScrollableLayout from "../layouts/ScrollableLayout";
import {useSearchParams} from "react-router-dom";
import {documentToUserVideo, UserVideo} from "../types/collections/UserVideo";
import {useNotificaiton} from "../contexts/NotificationProvider";
import FirebaseDatabaseService from "../services/database/strategies/FirebaseFirestoreService";
import firebaseFirestoreService from "../services/database/strategies/FirebaseFirestoreService";
import {documentToTranscript, Transcript} from "../types/collections/Transcript";
import {documentToSegment, Segment} from "../types/collections/Segment";
import {SegmentCard} from "../components/cards/segment-card/SegmentCard";
import {VideoPlayer} from "../components/video-player/VideoPlayer";

export interface VideoSegmentsProps {
    //
}

export const VideoSegments: React.FC<VideoSegmentsProps> = ({}) => {
    const [searchParams, _] = useSearchParams();
    const video_id = searchParams.get("video_id");
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [video, setVideo] = useState<UserVideo>();
    const [transcripts, setTranscripts] = useState<Transcript[]>();
    const [segments, setSegments] = useState<Segment[]>();
    const [selectedSegment, setSelectedSegment] = useState(-1);
    const [seekTo, setSeekTo] = useState(0);

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
            <h1 className={"text-title "}>Video Segments</h1>

            <div className="w-full flex flex-col gap-2">
                <div className="flex-1 flex flex-col gap-1 justify-start items-center">
                    {video && video.videoPath && <VideoPlayer className={"max-w-screen-lg sm:h-[50vh]"} path={video.videoPath} loadingText={"Loading Video..."} setCurrentTime={(time) => setCurrentTime(time)} seekTo={seekTo}/>}
                    <div className="w-full flex gap-[2px]">
                        {
                          segments && segments.map((elem) => {
                              return <button
                                onClick={() => {setSeekTo(elem.earliestStartTime)}}
                                className={`h-2 rounded-full overflow-hidden relative border ${elem.flagged ? 'border-red-500' : 'border-emerald-500' } ${elem.latestEndTime <= currentTime ? 'bg-blue-700' : ''} ${elem.earliestStartTime <= currentTime && currentTime <= elem.latestEndTime ? 'bg-blue-400' : ''}`}
                                style={{
                                    width: `${100 * ((elem.latestEndTime - elem.earliestStartTime) / (segments[segments.length - 1].latestEndTime))}%`
                                }}
                              >
                                  <div
                                    className="absolute bg-blue-700 h-full lef-0 top-0"
                                    style={{
                                        width: elem.earliestStartTime <= currentTime && currentTime <= elem.latestEndTime ? `${100 - 100 * ((elem.latestEndTime - currentTime) / (elem.latestEndTime - elem.earliestStartTime))}%` : 0
                                    }}
                                  ></div>
                              </button>
                          })
                        }
                    </div>
                </div>

                <div className="flex-1">
                    {
                        segments && segments.filter((elem) => {return elem.earliestStartTime <= currentTime && currentTime <= elem.latestEndTime}).map((elem) => {
                          return <SegmentCard currentSegment={elem} segmentId={elem.id} currentTime={currentTime}/>
                      })
                    }
                </div>
            </div>
        </div>

    </ScrollableLayout>
}