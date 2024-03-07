import React, {ChangeEvent, useEffect, useState} from 'react';
import ScrollableLayout from "../layouts/ScrollableLayout";
import Background from "../assets/landing-page-assets/background.png";
import {getVideoInfo} from "../services/youtube";
import {Video} from "../types/Video";
import {useNotificaiton} from "../contexts/NotificationProvider";
import FirebaseDatabaseService from "../services/database/strategies/FirebaseFirestoreService";
import {documentToProposedMatch, ProposedMatch} from "../types/collections/ProposedMatches";
import {MatchResults, matchResultsToDocument} from "../types/collections/self-supervised/MatchResults";
import {useAuth} from "../contexts/Authentication";
import {VideoCard} from "../components/cards/video-card/VideoCard";

export interface VideoMatchingPageProps {
    //
}

export const VideoMatchingPage : React.FC<VideoMatchingPageProps> = () => {

    const [videoPair, setVideoPair] = useState<ProposedMatch>({
        'id': '',
        'short_id': '',
        'long_id': '',
        'prediction_true': 0.9,
        'prediction_false': 0.6,
        'start_time': '',
        'end_time': ''
    })

    const [shortVideo, setShortVideo] = useState<Video>();
    const [longVideo, setLongVideo] = useState<Video>();
    const [times, setTimes] = useState({startTime:'', endTime:''})

    const {showNotification} = useNotificaiton();
    const {authState}= useAuth();

    const getNewRandom = async() => {
        FirebaseDatabaseService.getRandomDocument(
            'proposed_matches',
            (res) => {
                if (res) {
                    const matchedPair = documentToProposedMatch(res);
                    setVideoPair(matchedPair);
                    showNotification('Matched Pair', 'Got new pair', 'info', 5000);
                }
                setTimes({startTime:'', endTime:''});
            },
            (error) => {
                showNotification('Matched Pair', 'Unable to get new pair', 'error', 5000);
            }
            )
    }

    useEffect(() => {
        getNewRandom();
    }, []);

    useEffect(() => {
        const short_id = videoPair.short_id;
        const long_id = videoPair.long_id;

        if (short_id != "") {
            getVideoInfo(short_id).then((res) => {
                if (res) {
                    setShortVideo(res);
                } else {
                    showNotification('Video Collection', 'Unable to get the YouTube Short', 'error', 5000)
                }
            })
        }

        if (long_id != "") {
            getVideoInfo(long_id).then((res) => {
                if (res) {
                    setLongVideo(res);
                } else {
                    showNotification('Video Collection', 'Unable to get the original video', 'error', 5000)
                }
            })
        }

    }, [videoPair]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTimes(prevTimes => ({
            ...prevTimes,
            [name]: value
        }));
    }

    const setWrongVideoPair = (correct: boolean) => {
        const matchRes :MatchResults = {
            uid: '',
            matchId: videoPair.id,
            correct: correct,
            startTime: times.startTime,
            endTime: times.endTime,

        }
        FirebaseDatabaseService.addDocument(
            'self-supervised-match',
            matchResultsToDocument(matchRes),
            () => {
                showNotification(
                    correct ? 'Documents Matched' : 'Documents Not Match!',
                    'Document Corrected and Uploaded',
                    'success',
                    5000
                );
                getNewRandom();
            },
            () => {
                showNotification(
                    'Documents Matched',
                    'Document Matched Failed to Uploaded',
                    'error',
                    5000
                )
            }
            )
    }

    return <ScrollableLayout>
        <img onMouseDown={() => {return;}} className={"absolute z-0 top-10  opacity-75"} src={Background} alt={""}/>
        <div className={"z-10 relative container text-white"}>
            <h1 className={"text-title"}>Do these Videos Match</h1>
            <span className={"text-white"}><a href={"https://en.wikipedia.org/wiki/Self-supervised_learning"} className={"text-primary font-bold hover:underline"}>Self-Supervised Learning</a> is the next best thing... But I don’t have people to help - whenever you’re bored just come in and let me know if this is
right or wrong. </span>
            <div className={"flex flex-wrap sm:flex-nowrap  gap-2 sm:gap-20 justify-center py-5"}>

                {shortVideo && <VideoCard video={shortVideo} />}
                {longVideo && <VideoCard video={longVideo} />}

                <div className={"flex flex-col justify-center gap-2"}>
                    <button
                        onClick={() => {setWrongVideoPair(false)}}
                        className={"w-[200px] bg-red-400/10 hover:bg-red-400/30 px-5 py-2 rounded border border-white"}>
                        <p className={"font-bold hover:underline"}>Fuck Off</p>
                    </button>
                    <button
                        onClick={() => {getNewRandom();}}
                        className={"w-[200px] bg-blue-400/10 hover:bg-blue-400/30 px-5 py-2 rounded border border-white"}>
                        <p className={"font-bold hover:underline"}>Skip Video</p>
                    </button>
                    <button
                        onClick={() => {setWrongVideoPair(true)}}
                        className={"w-[200px] bg-green-400/10 hover:bg-green-400/30 px-5 py-2 rounded border border-white"}>
                        <p className={"font-bold hover:underline"}>Correct Pair</p>
                    </button>

                    <div className={"flex gap-2"} title={"What is the probability this is correct?"}>
                        <div className={"relative w-full h-5 bg-white/20"}>
                            <div className={"relative  top-0 left-0 h-5 bg-green-400/20"} style={{width: `${(videoPair.prediction_true * 100).toFixed(2)}%`}}>
                            </div>
                        </div>
                        <p>{(videoPair.prediction_true * 100).toFixed(2)}</p>
                    </div>

                    <div className={"flex gap-2"}>
                        <div className={"relative w-full h-5 bg-white/20"}>
                            <div className={"relative  top-0 left-0 h-5 bg-red-400/20"} style={{width: `${(videoPair.prediction_false * 100).toFixed(2)}%`}}>
                            </div>
                        </div>
                        <p>{(videoPair.prediction_false * 100).toFixed(2)}</p>
                    </div>

                    <form className={"flex  flex-col gap-2"} onSubmit={(e) => {
                        e.preventDefault(); // Prevents the default form submission behavior
                        showNotification('Updated Collection', 'Collection Updated', 'success', 5000);
                    }}>
                        <div className={"flex flex-col gap-2"}>
                            <label>
                                <p>Start Time</p>
                                <input
                                    className={"text-gray-400"}
                                    type="text"
                                    name="startTime"
                                    value={times.startTime}
                                    onChange={handleInputChange}
                                    pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$"
                                    placeholder="HH:MM:SS"

                                />
                            </label>
                        </div>
                        <div className={"flex flex-col gap-2"}>
                            <label>
                                <p>End Time</p>
                                <input
                                    className={"text-gray-400"}
                                    type="text"
                                    name="endTime"
                                    value={times.endTime}
                                    onChange={handleInputChange}
                                    pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$"
                                    placeholder="HH:MM:SS"
                                />
                            </label>
                        </div>
                    </form>
                </div>
            </div>
        </div>

    </ScrollableLayout>
}