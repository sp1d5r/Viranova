import {DocumentData} from 'firebase/firestore';

type UserVideoStatus = "Uploaded" | "Transcribing" | "Diarizing" | "Segmenting" | "Summarizing Segments" | "Clip Transcripts" | "Preprocessing Complete"

export interface UserVideo {
    videoPath: string;
    originalFileName: string;
    uploadTimestamp: number;
    status: UserVideoStatus;
    processingProgress: number;
    progressMessage: string;
    uid: string;
    queuePosition: number;
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
        queuePosition: docData.queuePosition,
    };
}

export function userVideoToDocument(userVideo: UserVideo): DocumentData {
    return { ...userVideo, 'previousStatus': null };
}