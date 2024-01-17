export interface Video {
    videoId: string;
    videoTitle: string;
    videoDescription: string;
    videoUrl: string;
    thumbnailUrl: string;
}


export interface ProposedVideo {
    order: number;
    video: Video;
}