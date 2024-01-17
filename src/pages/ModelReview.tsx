import React, {useEffect, useState} from 'react';
import {Video, ProposedVideo, VectorVideo, VectorSimilarity} from "../types/Video";
import {ReviewVideo} from "./ReviewVideo";
import {getRelatedOriginalVideos, getShorts} from "../services/zilis";
import {getVideoInfo} from "../services/youtube";


export interface ModelReviewProps {}

const _youtubeVideo: Video = {
    videoId: "1",
    videoTitle: "Orignal Video ID",
    videoDescription: "Short Description",
    videoUrl: "https://www.youtube.com/shorts/sq84rJhtvTc",
    thumbnailUrl: "https://placehold.co/600x400",
}


export const ModelReview : React.FC<ModelReviewProps> = ({}) => {
    const [videoShorts, setVideoShorts] = useState<VectorVideo[]>([]);
    const [youtubeShort, setYoutubShort] = useState<Video>({
        videoId: "1",
        videoTitle: "Short Title",
        videoDescription: "Short Description",
        videoUrl: "https://www.youtube.com/shorts/sq84rJhtvTc",
        thumbnailUrl: "https://placehold.co/600x400",
    })

    const [proposedYoutubeVideos, setProposedVideos] = useState<ProposedVideo[]>([
        {video: _youtubeVideo, order: 1},
        {video: _youtubeVideo, order: 2},
        {video: _youtubeVideo, order: 3},
        {video: _youtubeVideo, order: 4},
        {video: _youtubeVideo, order: 5},
    ])


    useEffect(() => {
        getShorts().then((vectorVideos: VectorVideo[] | undefined) => {
            if (vectorVideos) {
                setVideoShorts(vectorVideos);
            }
        })
    }, []);

    useEffect(() => {
        // Get the proposed videos.
        getNewVideo();
    }, [videoShorts])


    // @ts-ignore
    const getNewVideo = async () => {
        let _vectorVideos: VectorVideo[] = [...videoShorts];
        const vectorVideo: VectorVideo | undefined = _vectorVideos.pop();

        if (vectorVideo) {
            try {
                const short = await getVideoInfo(vectorVideo.video_id);
                if (short) {
                    setYoutubShort(short);
                }

                const result: VectorSimilarity[] | undefined = await getRelatedOriginalVideos(vectorVideo.vector_embedding);
                if (result) {
                    // Take only the first 5 results
                    const firstFiveResults : VectorSimilarity[] = result.slice(0, 5);

                    // Call getVideoInfo for each videoId and wait for all to complete
                    const videoInfos : (Video | undefined) [] = await Promise.all(
                        firstFiveResults.map((similarity: VectorSimilarity)=> getVideoInfo(similarity.video_id))
                    );

                    const definedVideoInfos: Video[] = videoInfos.filter((video: (Video | undefined)): video is Video => video !== undefined);

                    const _proposedYoutubeVideos = definedVideoInfos.map((video: Video, index: number) => ({
                        order: index + 1,
                        video: video
                    }));

                    setProposedVideos(_proposedYoutubeVideos);
                }
            } catch (error) {
                console.error('Error getting new video:', error);
            }
        }
    };


    const updateVideoEntry = (shortVideoId: string, originalVideoId: string) => {
        // Update Zilis database where videoId == shortVideoId
            // viewed = True
            // verified = True
            // originalVideoId = new video
        console.log(`Youtube Short Id: ${shortVideoId} linked to original video: ${originalVideoId}`);
    }

    const skip = () => {
        // Update the property on the Zilis database
            // viewed = True
            // verified = False
        //

        getNewVideo();
        return;
    }

    const selectOption = (option: number) => {
        const relatedOriginalVideo = proposedYoutubeVideos.filter((elem) => {return elem.order === option});
        if (relatedOriginalVideo.length == 1) {
            const selectedVideoId = relatedOriginalVideo[0].video.videoId;
            updateVideoEntry(youtubeShort.videoId, selectedVideoId);
        }
        getNewVideo();
    }

    return <section className={"w-full h-[100vh]  flex flex-col gap-5 p-5 container"}>
        <h1 className={"text-title text-primary"}>Human Review</h1>
        <p className={"text-bold text-accent"}>To review the effectiveness of the embedding model, manually review new datapoints.</p>
        <ReviewVideo  proposedYoutubeVideos={proposedYoutubeVideos} youtubeShort={youtubeShort} skip={skip} selectOption={selectOption}/>
    </section>
}