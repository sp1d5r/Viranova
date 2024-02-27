import {DocumentData} from "firebase/firestore";

export interface MatchResults {
    uid: string;
    matchId: string;
    correct: Boolean;
    startTime: string;
    endTime: string;
}


export function documentToMatchResults(docData: DocumentData): MatchResults {
    return {
        uid: docData.uid,
        matchId: docData.match_id,
        correct: docData.correct,
        startTime: docData.start_time,
        endTime: docData.end_time,
    };
}

export function matchResultsToDocument(matchResults: MatchResults): DocumentData {
    return {
        uid: matchResults.uid,
        match_id: matchResults.matchId,
        correct: matchResults.correct,
        start_time: matchResults.startTime,
        end_time: matchResults.endTime,
    };
}