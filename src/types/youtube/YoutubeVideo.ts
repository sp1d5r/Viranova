export interface Video {
  videoId: string;
  videoTitle: string;
  videoDescription: string;
  videoUrl: string;
  thumbnailUrl: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags: string[];
  categoryId: string;
  defaultLanguage?: string;
  defaultAudioLanguage?: string;
  isLiveBroadcast: boolean;
  liveBroadcastContent: 'live' | 'upcoming' | 'none';
  dimension: '2d' | '3d';
  definition: 'hd' | 'sd';
  caption: boolean;
  licensedContent: boolean;
  projection: 'rectangular' | '360';
  topicCategories: string[];
  statistics: {
    viewCount: number;
    likeCount: number;
    dislikeCount: number;
    favoriteCount: number;
    commentCount: number;
  };
  thumbnails: {
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