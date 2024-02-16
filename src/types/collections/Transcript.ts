import {DocumentData} from 'firebase/firestore';
import {Word, documentToWord} from "./Word";

export interface Transcript {
    confidence: number;
    earliestStartTime: number;
    latestEndTime: number;
    index: number;
    languageCode: string;
    transcript: string;
    videoId: string;
    words?: Word[];
    transcriptId: string;
}


export function documentToTranscript(docData: DocumentData): Transcript {
    return {
        confidence: docData.confidence,
        earliestStartTime: docData.earliest_start_time,
        latestEndTime: docData.latest_end_time,
        index: docData.index,
        languageCode: docData.language_code,
        transcript: docData.transcript,
        videoId: docData.video_id,
        words: docData.words? docData.words.map((index:number, word:DocumentData) => {
            return documentToWord(word);
        }) : undefined,
        transcriptId: docData.id,
    };
}

export function transcriptToDocument(transcript: Transcript): DocumentData {
    return {
        confidence: transcript.confidence,
        earliest_start_time: transcript.earliestStartTime,
        latest_end_time: transcript.latestEndTime,
        index: transcript.index,
        language_code: transcript.languageCode,
        transcript: transcript.transcript,
        video_id: transcript.videoId,
    };
}