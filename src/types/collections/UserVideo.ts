import {doc, DocumentData} from 'firebase/firestore';
import firebase from "firebase/compat";
import DocumentSnapshot = firebase.firestore.DocumentSnapshot;

type UserVideoStatus = "Uploaded" | "Transcribing" | "Diarizing" | "Segmenting" | "Summarizing Segments"

export interface UserVideo {
    videoId: string;
    videoPath: string;
    originalFileName: string;
    uploadTimestamp: number;
    status: UserVideoStatus;
    processingProgress: number;
    uid: string;
}

export function documentToUserVideo(docSnap: DocumentSnapshot): UserVideo {
    const docData = docSnap.data();
    if (!docData) {
        throw new Error('Document data is undefined');
    }
    return {
        videoId: docSnap.id,
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