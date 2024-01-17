import React, {useState} from 'react';
import {Video, ProposedVideo} from "../types/Video";
import {ReviewVideo} from "./ReviewVideo";

export interface ModelReviewProps {}

const _youtubeVideo: Video = {
    videoId: "1",
    videoTitle: "Orignal Video ID",
    videoDescription: "Short Description",
    videoUrl: "https://www.youtube.com/shorts/sq84rJhtvTc",
    thumbnailUrl: "https://placehold.co/600x400",
}


export const ModelReview : React.FC<ModelReviewProps> = ({}) => {
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

    const getNewVideo = () => {
        // get a new zilis video that hasn't been viewed yet
        // viewed = False
    }

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