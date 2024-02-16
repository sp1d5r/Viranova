import {DocumentData} from 'firebase/firestore';

export interface Word {
    startTime: number;
    endTime: number;
    index: number;
    speakerTag: string;
    word: string;
}

export function documentToWord(docData: DocumentData): Word {
    return {
        startTime: docData.start_time,
        endTime: docData.end_time,
        index: docData.index,
        speakerTag: docData.speaker_tag,
        word: docData.word,
    };
}

export function wordToDocument(word: Word): DocumentData {
    return {
        start_time: word.startTime,
        end_time: word.endTime,
        index: word.index,
        speaker_tag: word.speakerTag,
        word: word.word
    };
}