import React, {useEffect, useState} from 'react';
import ScrollableLayout from "../layouts/ScrollableLayout";
import {useSearchParams} from "react-router-dom";
import {documentToUserVideo, UserVideo} from "../types/collections/UserVideo";
import {useNotification} from "../contexts/NotificationProvider";
import FirebaseDatabaseService from "../services/database/strategies/FirebaseFirestoreService";
import firebaseFirestoreService from "../services/database/strategies/FirebaseFirestoreService";
import {documentToTranscript, Transcript} from "../types/collections/Transcript";
import {documentToSegment, Segment} from "../types/collections/Segment";
import {SegmentCard} from "../components/cards/segment-card/SegmentCard";
import {VideoPlayer} from "../components/video-player/VideoPlayer";
import {RecommendedShortIdeas} from "../components/video-handler/RecommendedShortIdea";

export interface VideoSegmentsProps {
    videoId?: string;
}

export const VideoSegments: React.FC<VideoSegmentsProps> = ({videoId}) => {
    const [searchParams, _] = useSearchParams();
    const video_id = searchParams.has("video_id") ? searchParams.get("video_id") : videoId;
    const videoFromSearch = searchParams.has("video_id")
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [video, setVideo] = useState<UserVideo>();
    const [transcripts, setTranscripts] = useState<Transcript[]>();
    const [segments, setSegments] = useState<Segment[]>([]);
    const [segmentHovered, setSegmentHovered] = useState(-1);
    const [seekTo, setSeekTo] = useState(0);

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

    const handleSeek = (time: number) => {
        setSeekTo(time);
    }

    const VideoSegmentation : React.FC = () => {
        return <div className={"flex flex-col"}>
            <div className="w-full flex flex-col gap-2">
                <div className="flex-1 flex flex-col gap-2 justify-start items-center">

                    <div className="w-full flex gap-2 justify-center flex-wrap sm:flex-nowrap ">
                        {video && video.videoPath && <VideoPlayer className={"flex-1 sm:h-[50vh]"} path={video.videoPath} loadingText={"Loading Video..."} setCurrentTime={(time) => setCurrentTime(time)} seekTo={seekTo}/>}
                        <RecommendedShortIdeas segments={segments} currentTime={currentTime} onSeek={handleSeek} />
                    </div>

                    <div className="w-full flex gap-[2px]">
                        {
                          segments && segments.map((elem, index) => {
                              return <button
                                onClick={() => {setSeekTo(elem.earliestStartTime)}}
                                className={`h-5 rounded-md relative border ${elem.flagged ? 'border-red-500' : 'border-emerald-500' } ${elem.latestEndTime <= currentTime ? 'bg-emerald-700' : ''} ${elem.earliestStartTime <= currentTime && currentTime <= elem.latestEndTime ? 'bg-emerald-950' : ''} ${elem.earliestStartTime >= currentTime ? 'bg-gray-700' : ''}`}
                                style={{
                                    width: `${100 * ((elem.latestEndTime - elem.earliestStartTime) / (segments[segments.length - 1].latestEndTime))}%`
                                }}
                                onMouseEnter={() => {setSegmentHovered(index); console.log(index)}}
                                onMouseLeave={() => {setSegmentHovered(-1)}}
                              >
                                  {
                                    index == segmentHovered && <div className="absolute h-32 w-64 bottom-[20px] left-1/2 -translate-x-1/2">
                                        <div className="relative w-full h-full z-10">
                                            <div className="absolute bottom-1 bg-gray-900 border border-gray-200  w-full -translate-y-[2px] shadow-sm rounded-lg p-2">
                                                <p className="text-sm font-normal text-gray-400">{elem.segmentTitle}</p>
                                            </div>
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rotate-45 z-20 border-r border-b border-gray-200 w-3 h-3 bg-gray-900 rounded-sm" />
                                        </div>
                                    </div>
                                  }
                                  <div className="absolute top-0 left-0 rounded-md w-full h-full overflow-hidden">
                                      <div
                                        className="absolute bg-emerald-700 h-[98%] left-0 top-0 translate-y-[1%] rounded-md overflow-hidden border-emerald-500"
                                        style={{
                                            width: elem.earliestStartTime <= currentTime && currentTime <= elem.latestEndTime ? `${100 - 100 * ((elem.latestEndTime - currentTime) / (elem.latestEndTime - elem.earliestStartTime))}%` : 0
                                        }}
                                      ></div>
                                  </div>
                              </button>
                          })
                        }
                    </div>
                </div>

                <div className="flex-1">
                    {
                      segments && segments.filter((elem) => {return elem.earliestStartTime <= currentTime && currentTime <= elem.latestEndTime}).reverse().map((elem, index) => {
                          if (index == 0){
                              return <SegmentCard currentSegment={elem} segmentId={elem.id} currentTime={currentTime}/>
                          }
                      })
                    }
                </div>
            </div>
        </div>;
    }

    if (!videoFromSearch) {
        return <VideoSegmentation />
    }
    return <ScrollableLayout>
        <h1 className={"text-title "}>Video Segments</h1>
        <VideoSegmentation />
    </ScrollableLayout>
}