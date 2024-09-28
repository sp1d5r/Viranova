import {DocumentData, Timestamp} from 'firebase/firestore';
import {BackendServerMetadata, ServerStatus} from "./BackendServerMetadata";

type UserVideoStatus = "Uploaded" | "Link Provided" | "Transcribe" | "Diarizing" | "Segmenting" | "Summarizing Segments" | "Clip Transcripts" | "Preprocessing Complete" | "Create TikTok Ideas"

export interface UserVideo extends BackendServerMetadata {
    // Existing fields
    videoPath: string;
    originalFileName: string;
    uploadTimestamp: number | Timestamp;
    status: UserVideoStatus;
    processingProgress: number;
    progressMessage: string;
    uid?: string;
    link?: string;
    queuePosition: number;
    id?: string;
    channelId?: string;

    error?: boolean;
    errorMessage?: string;

    // New fields from Video interface
    videoId?: string;
    videoTitle?: string;
    videoDescription?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    channelTitle?: string;
    publishedAt?: string;
    duration?: string;
    viewCount?: number;
    likeCount?: number;
    commentCount?: number;
    tags?: string[];
    categoryId?: string;
    defaultLanguage?: string;
    defaultAudioLanguage?: string;
    isLiveBroadcast?: boolean;
    liveBroadcastContent?: 'live' | 'upcoming' | 'none';
    dimension?: '2d' | '3d';
    definition?: 'hd' | 'sd';
    caption?: boolean;
    licensedContent?: boolean;
    projection?: 'rectangular' | '360';
    topicCategories?: string[];
    statistics?: {
        viewCount: number;
        likeCount: number;
        dislikeCount: number;
        favoriteCount: number;
        commentCount: number;
    };
    thumbnails?: {
        default: ThumbnailInfo;
        medium: ThumbnailInfo;
        high: ThumbnailInfo;
        standard?: ThumbnailInfo;
        maxres?: ThumbnailInfo;
    };
}

interface ThumbnailInfo {
    url: string;
    width: number;
    height: number;
}

export function documentToUserVideo(docData: DocumentData): UserVideo {
    return {
        videoPath: docData.videoPath,
        originalFileName: docData.originalFileName,
        uploadTimestamp: docData.uploadTimestamp,
        status: docData.status,
        processingProgress: docData.processingProgress,
        progressMessage: docData.progressMessage,
        uid: docData.uid,
        link: docData.link,
        queuePosition: docData.queuePosition,
        id: docData.id,
        backend_status: docData.backend_status,
        channelId: docData.channelId,
        videoId: docData.videoId,
        videoTitle: docData.videoTitle,
        videoDescription: docData.videoDescription,
        videoUrl: docData.videoUrl,
        thumbnailUrl: docData.thumbnailUrl,
        channelTitle: docData.channelTitle,
        publishedAt: docData.publishedAt,
        duration: docData.duration,
        viewCount: docData.viewCount,
        likeCount: docData.likeCount,
        commentCount: docData.commentCount,
        tags: docData.tags,
        categoryId: docData.categoryId,
        defaultLanguage: docData.defaultLanguage,
        defaultAudioLanguage: docData.defaultAudioLanguage,
        isLiveBroadcast: docData.isLiveBroadcast,
        liveBroadcastContent: docData.liveBroadcastContent,
        dimension: docData.dimension,
        definition: docData.definition,
        caption: docData.caption,
        licensedContent: docData.licensedContent,
        projection: docData.projection,
        topicCategories: docData.topicCategories,
        statistics: docData.statistics,
        thumbnails: docData.thumbnails,
        error: docData.error,
        errorMessage: docData.errorMessage
    };
}

export function userVideoToDocument(userVideo: UserVideo): DocumentData {
    return { ...userVideo, 'previousStatus': null };
}

export const getThumbnailUrl = (video: UserVideo) => {
    let thumbnailUrl = 'https://via.placeholder.com/320x180.png?text=No+Thumbnail';

    if (video.thumbnailUrl) {
      thumbnailUrl = video.thumbnailUrl;
    }

    if (video.thumbnails) {
      const thumbnails = video.thumbnails;

      if (thumbnails.high.url) {
        thumbnailUrl = thumbnails.high.url;
      } else if (thumbnails.standard?.url) {
        thumbnailUrl = thumbnails.standard?.url;
      } else if (thumbnails.maxres?.url) {
        thumbnailUrl = thumbnails.maxres?.url;
      } else if (thumbnails.medium.url) {
        thumbnailUrl = thumbnails.medium.url;
      } else if (thumbnails.default.url) {
        thumbnailUrl = thumbnails.default.url;
      }
    }

    return thumbnailUrl;
  };