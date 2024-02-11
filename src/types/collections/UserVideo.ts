import {doc, DocumentData} from 'firebase/firestore';

type UserVideoStatus = "Uploaded" | "Transcribing" | "Diarizing" | "Segmenting" | "Summarizing Segments"

export interface UserVideo {
    videoPath: string;
    originalFileName: string;
    uploadTimestamp: number;
    status: UserVideoStatus;
    processingProgress: number;
    uid: string;
}

export function documentToUserVideo(docData: DocumentData): UserVideo {
    return {
        videoPath: docData.videoPath,
        originalFileName: docData.originalFileName,
        uploadTimestamp: docData.uploadTimestamp,
        status: docData.status,
        processingProgress: docData.processingProgress,
        uid: docData.uid,
    };
}

export function userVideoToDocument(userVideo: UserVideo): DocumentData {
    return { ...userVideo };
}