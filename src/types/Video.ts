export interface Video {
    videoId: string;
    videoTitle: string;
    videoDescription: string;
    videoUrl: string;
    thumbnailUrl: string;
}

export interface VectorVideo {
    is_verified: boolean;
    linked_video_id: string;
    vector_embedding: number[];
    video_id: string;
    video_type: "SHORT" | "ORIGINAL";
}

export interface ProposedVideo {
    order: number;
    video: Video;
}

export interface VectorSimilarity {
    distance: string;
    video_id: string;
    video_type: string;
}