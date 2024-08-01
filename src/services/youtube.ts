import axios from 'axios';
import {Video} from "../types/Video";
import {Video as YoutubeVideo} from "../types/youtube/YoutubeVideo";

const getRecentChannelVideos = async (channelId: string, maxResults: number = 10): Promise<YoutubeVideo[]> => {
    const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&order=date&maxResults=${maxResults}&type=video`;

    try {
        // First, get the list of recent video IDs
        const searchResponse = await axios.get(searchUrl);
        const videoIds = searchResponse.data.items.map((item: any) => item.id.videoId);

        // Then, get detailed information for each video
        const videoUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds.join(',')}&part=snippet,contentDetails,statistics,topicDetails,status`;
        const videoResponse = await axios.get(videoUrl);

        const videos: YoutubeVideo[] = videoResponse.data.items.map((videoData: any) => ({
            videoId: videoData.id,
            videoTitle: videoData.snippet.title,
            videoDescription: videoData.snippet.description,
            videoUrl: `https://www.youtube.com/watch?v=${videoData.id}`,
            thumbnailUrl: videoData.snippet.thumbnails.high.url,
            channelId: videoData.snippet.channelId,
            channelTitle: videoData.snippet.channelTitle,
            publishedAt: videoData.snippet.publishedAt,
            duration: videoData.contentDetails.duration,
            viewCount: parseInt(videoData.statistics.viewCount),
            likeCount: parseInt(videoData.statistics.likeCount),
            commentCount: parseInt(videoData.statistics.commentCount),
            tags: videoData.snippet.tags || [],
            categoryId: videoData.snippet.categoryId,
            defaultLanguage: videoData.snippet.defaultLanguage,
            defaultAudioLanguage: videoData.snippet.defaultAudioLanguage,
            isLiveBroadcast: videoData.snippet.liveBroadcastContent !== 'none',
            liveBroadcastContent: videoData.snippet.liveBroadcastContent,
            dimension: videoData.contentDetails.dimension,
            definition: videoData.contentDetails.definition,
            caption: videoData.contentDetails.caption === 'true',
            licensedContent: videoData.contentDetails.licensedContent,
            projection: videoData.contentDetails.projection,
            topicCategories: videoData.topicDetails?.topicCategories || [],
            statistics: {
                viewCount: parseInt(videoData.statistics.viewCount),
                likeCount: parseInt(videoData.statistics.likeCount),
                dislikeCount: parseInt(videoData.statistics.dislikeCount),
                favoriteCount: parseInt(videoData.statistics.favoriteCount),
                commentCount: parseInt(videoData.statistics.commentCount),
            },
            thumbnails: videoData.snippet.thumbnails,
        }));

        return videos;
    } catch (error) {
        console.error('Error fetching channel videos:', error);
        return [];
    }
};

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

export {getVideoInfo, getRecentChannelVideos}