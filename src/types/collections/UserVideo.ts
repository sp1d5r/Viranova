import {DocumentData} from 'firebase/firestore';
import {BackendServerMetadata, ServerStatus} from "./BackendServerMetadata";

type UserVideoStatus = "Uploaded" | "Link Provided" | "Transcribing" | "Diarizing" | "Segmenting" | "Summarizing Segments" | "Clip Transcripts" | "Preprocessing Complete" | "Create TikTok Ideas"

export interface UserVideo extends BackendServerMetadata{
    videoPath: string;
    originalFileName: string;
    uploadTimestamp: number;
    status: UserVideoStatus;
    processingProgress: number;
    progressMessage: string;
    uid: string;
    link?: string;
    queuePosition: number;
    id?: string;
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
        backend_status: docData.backend_status
    };
}

export function userVideoToDocument(userVideo: UserVideo): DocumentData {
    return { ...userVideo, 'previousStatus': null };
}