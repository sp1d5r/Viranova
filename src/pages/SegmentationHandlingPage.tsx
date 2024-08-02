import React, {useEffect, useState} from 'react';
import ScrollableLayout from "../layouts/ScrollableLayout";
import {useAuth} from "../contexts/Authentication";
import {SegmentationIntro} from "../components/segmentation/SegmentationIntro";
import {useNotification} from "../contexts/NotificationProvider";
import {SpacialSegmentation} from "../components/segmentation/SpacialSegmentation";
import {SegmentationGroup} from "../types/segmentation-masks/SegmentationGroup";
import axios from 'axios';
import Background from "../assets/landing-page-assets/background.png";
import {TemporalSegmentation} from "../components/segmentation/TemporalSegmentation";

export interface SegmentationHandlingPageProps {
    //
}

export type PageState = "Introduction" |
    "SpacialSegmentation" |
    "TemporalSegmentation" |
    "ConfirmSegments" |
    "SegmentationComplete";

export const SegmentationHandlingPage: React.FC<SegmentationHandlingPageProps> = ({}) => {
    const {authState} = useAuth();
    const {showNotification} = useNotification();
    const [pageState, setPageState] = useState<PageState>("Introduction");
    const [videoFile, setVideoFile] = useState("");
    const [segmentationGroup, setSegmentationGroup] = useState<SegmentationGroup>({
        frames: [],
        segmentationMasks: [],
        spacialGroups: [],
        temporalGroups: [],
        videoId: ""
    })

    const getVideoFile = () => {
        axios.get('http://165.227.237.249:8000/get-random-video', { timeout: 30000 }) // 30 seconds timeout
            .then(response => {
                const video_file : string = response.data.video_file;
                setVideoFile(video_file)

            })
            .catch(error => console.error('Error:', error));

    }

    const getSegmentationGroup = () => {
        axios.get(`http://165.227.237.249:8000/load-segmentation-from-file/${videoFile}`, { timeout: 300000 })
            .then( response => {
                console.log(response.data.frames.length, response.data.masks.length)
                const segmentationGroup : SegmentationGroup = {
                    frames: response.data.frames.map((frame: string, index: number) => {
                        return {imageData: frame, frameNumber: index}
                    }),
                    segmentationMasks: response.data.masks.map((frameSegments:number[][][]) => {
                        return frameSegments.map((segment: number[][]) => {
                            return {mask: segment}
                        })
                    }),
                    spacialGroups: response.data.masks.map((mask:number[][], index: number) => {
                        return Array.from({length: mask.length}, (_, i) => i + 1);
                    }),
                    temporalGroups: [],
                    videoId: response.data.video_id
                }
                console.log(segmentationGroup.segmentationMasks.length, segmentationGroup.segmentationMasks[0].length)
                setSegmentationGroup(segmentationGroup);
            })
            .catch(error => console.error('Error:', error))
    }

    useEffect(() => {
        if (!authState.isAuthenticated) {
            showNotification("Authentication Verification", "Not implemented yet", "error", 5000)
        }
    }, [authState]);

    return <ScrollableLayout>
        <img onMouseDown={() => {return;}} className={"absolute z-0 top-10  opacity-75"} src={Background} alt={""}/>
        <div className={"container relative z-10"}>
            {
                pageState === "Introduction" ?
                    <SegmentationIntro
                        setPageState={setPageState}
                        videoFile={videoFile}
                        getNewVideoFile={getVideoFile}
                        getSegmentationGroup={getSegmentationGroup}
                        segmentationGroup={segmentationGroup}
                    /> :
                pageState === "SpacialSegmentation" ?
                    <SpacialSegmentation
                        segmentationGroup={segmentationGroup}
                        setPageState={setPageState}
                        setSegmentationGroup={setSegmentationGroup}
                    /> :
                pageState === "TemporalSegmentation" ?
                    <TemporalSegmentation
                      setPageState={setPageState}
                      segmentationGroup={segmentationGroup}
                    /> :
                pageState === "SegmentationComplete" ?
                    <div></div> :
                <div>
                    <h1>Error. Please Refresh Page..</h1>
                </div>
            }
        </div>
    </ScrollableLayout>;
}
