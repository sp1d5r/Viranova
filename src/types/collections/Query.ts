import { Timestamp } from "firebase/firestore";

export interface Query {
    id?: string;
    queryText: string;
    queryModel: string;
    queryResults: number;
    channelFilter: string[];
    videoFilter: string[];
    queryCreatedAt: Timestamp;
    status: string;
    uid: string;
    // Optional parameters
    embeddingValue?: number[];
    filterResults?: FilterResult[];
    queriedTime?: Timestamp;
    fromComment?: string;
}

interface FilterResult {
    distance: number;
    segment_id: string;
    channel_id: string;
    video_id: string;
}