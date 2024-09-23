import axios from 'axios';
import {Video as YoutubeVideo} from "../types/youtube/YoutubeVideo";
import { parse, toSeconds } from 'iso8601-duration';

const MIN_DURATION_SECONDS = 100
const MAX_DURATION_SECONDS = 5400;


const getVideoInfo = async (videoId: string): Promise<YoutubeVideo | undefined> => {
    const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics,topicDetails,status&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const videoData = response.data.items[0];
        const snippet = videoData.snippet;
        const contentDetails = videoData.contentDetails;
        const statistics = videoData.statistics;

        const videoInfo: YoutubeVideo = {
            videoId: videoId,
            videoTitle: snippet.title,
            videoDescription: snippet.description,
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
            thumbnailUrl: snippet.thumbnails.default.url,
            channelId: snippet.channelId,
            channelTitle: snippet.channelTitle,
            publishedAt: snippet.publishedAt,
            duration: contentDetails.duration || 'PT0S',
            viewCount: parseInt(statistics.viewCount || '0'),
            likeCount: parseInt(statistics.likeCount || '0'),
            commentCount: parseInt(statistics.commentCount || '0'),
            tags: snippet.tags || [],
            categoryId: snippet.categoryId || '1',
            defaultLanguage: snippet.defaultLanguage || 'en',
            defaultAudioLanguage: snippet.defaultAudioLanguage || 'en',
            isLiveBroadcast: snippet.liveBroadcastContent !== 'none',
            liveBroadcastContent: snippet.liveBroadcastContent || 'none',
            dimension: contentDetails.dimension || '2d',
            definition: contentDetails.definition || 'hd',
            caption: contentDetails.caption === 'true',
            licensedContent: contentDetails.licensedContent || false,
            projection: contentDetails.projection || 'rectangular',
            topicCategories: videoData.topicDetails?.topicCategories || [],
            statistics: {
                viewCount: parseInt(statistics.viewCount || '0'),
                likeCount: parseInt(statistics.likeCount || '0'),
                dislikeCount: parseInt(statistics.dislikeCount || '0'),
                favoriteCount: parseInt(statistics.favoriteCount || '0'),
                commentCount: parseInt(statistics.commentCount || '0'),
            },
            thumbnails: {
                default: snippet.thumbnails.default,
                medium: snippet.thumbnails.medium,
                high: snippet.thumbnails.high,
                standard: snippet.thumbnails.standard,
                maxres: snippet.thumbnails.maxres,
            },
        };

        return videoInfo;
    } catch (error) {
        console.error('Error fetching video data:', error);
        throw error;
    }
};


const getRecentChannelVideos = async (channelId: string, maxResults: number = 30): Promise<YoutubeVideo[]> => {
    const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&order=date&maxResults=${maxResults}&type=video`;

    try {
        // First, get the list of recent video IDs
        const searchResponse = await axios.get(searchUrl);
        const videoIds = searchResponse.data.items.map((item: any) => item.id.videoId);

        // Then, get detailed information for each video
        const videoUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds.join(',')}&part=snippet,contentDetails,statistics,topicDetails,status`;
        const videoResponse = await axios.get(videoUrl);

        const videos: YoutubeVideo[] = videoResponse.data.items
          .filter((videoData: any) => {
              const durationInSeconds = toSeconds(parse(videoData.contentDetails.duration));
              return MIN_DURATION_SECONDS < durationInSeconds && durationInSeconds <= MAX_DURATION_SECONDS;
          })
          .map((videoData: any) => ({
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


export {getVideoInfo, getRecentChannelVideos}