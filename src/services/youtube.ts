import axios from 'axios';
import {Video} from "../types/Video";

const getVideoInfo = async (videoId: string) : Promise<Video | undefined> => {
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${process.env.REACT_APP_GOOGLE_API_KEY}`;

    try {
        const response = await axios.get(url);
        console.log(response);
        console.log(videoId);
        const videoData = response.data.items[0].snippet;

        const videoInfo: Video = {
            videoId: videoId,
            videoTitle: videoData.title,
            videoDescription: videoData.description.slice(0,200),
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
            thumbnailUrl: videoData.thumbnails.high.url
        };

        return videoInfo;
    } catch (error) {
        console.error('Error fetching video data:', error);
    }
};

// const convertVectorToVideo = async (vectorVideo: VectorVideo) :Promise<Video| undefined> => {
//     const video = await getVideoInfo(vectorVideo.video_id);
//     return video
// }

export {getVideoInfo}