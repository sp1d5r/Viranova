import {Timestamp} from "firebase/firestore";

export interface AuthorMeta {
  fans: number;
  heart: number;
  video: number;
  ttSeller: boolean;
  verified: boolean;
  avatar: string;
  friends: number;
  roomId: string;
  privateAccount: boolean;
  nickName: string;
  digg: number;
  following: number;
  id: string;
}

export interface SubtitleLinks {
  downloadLink: string;
  tiktokLink: string;
  language: string;
}

export interface VideoMeta {
  downloadAddr: string;
  originalCoverUrl: string;
  duration: number;
  definition: string;
  coverUrl: string;
  format: string;
  originalDownloadAddr: string;
  subtitleLinks: SubtitleLinks[];
  height: number;
  width: number;

}

export interface MusicMeta {
  musicAuthor: string;
  musicName: string;
  coverMediumUrl: string;
  musicOriginal: boolean;
  musicId: string;
  playUrl: string;
}

export interface VideoAnalytics {
  submittedVideoUrl: string;
  locationCreated: string;
  hashtags: string[];
  mediaUrls:  string[];
  id: string;
  authorMeta: AuthorMeta;
  commentCount: number;
  isPinned: boolean;
  videoMeta: VideoMeta;
  shareCount: number;
  mentions: string[];
  diggCount: number;
  webVideoUrl: string;
  musicMeta: MusicMeta;
  collectCount: number;
  text: string;
  createTimeISO: string;
  createTime: number;
  playCount: number;
}
export interface Analytics {
  taskTime: Timestamp;
  videoId: string;
  tiktokLink: string;
  videoAnalytics: VideoAnalytics[];
  taskResultId: string;
  shortId: string;
  id: string;
}
