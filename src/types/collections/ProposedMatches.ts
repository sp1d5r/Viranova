import {DocumentData} from "firebase/firestore";

export interface ProposedMatch {
    id: string;
    long_id: string;
    short_id: string;
    prediction_false: number;
    prediction_true: number;
    start_time: string;
    end_time: string;
}


export function documentToProposedMatch(docData: DocumentData): ProposedMatch {
    return {
        id: docData.id,
        long_id: docData.long_id,
        short_id:  docData.short_id,
        prediction_false:  docData.prediction_false,
        prediction_true: docData.prediction_true,
        start_time: "",
        end_time: "",
    };
}

export function proposedMatchToDocument(proposedMatch: ProposedMatch): DocumentData {
    return {
        id: proposedMatch.id,
        long_id: proposedMatch.long_id,
        short_id:  proposedMatch.short_id,
        prediction_false:  proposedMatch.prediction_false,
        prediction_true: proposedMatch.prediction_true,
        start_time: proposedMatch.start_time,
        end_time: proposedMatch.end_time,
    };
}