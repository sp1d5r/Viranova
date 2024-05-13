import {DocumentData} from "firebase/firestore";

export interface Segment {
    id: string;
    earliestStartTime: number;
    endIndex: number;
    flagged: boolean;
    harassment: boolean;
    harassmentThreatening: boolean;
    hate: boolean;
    hateThreatening: boolean;
    index: number;
    segmentSummary: string;
    selfHarm: boolean;
    sexual: boolean;
    sexualMinors: boolean;
    startIndex: boolean;
    transcript: string;
    latestEndTime: number;
    selfHarmIntent: string;
    videoId: string;
    segmentStatus: string;
    shortIdea: string;
    shortIdeaExplanation: string;
}


export function documentToSegment(docData: DocumentData): Segment {
    return {
        id: docData.id,
        earliestStartTime: docData.earliest_start_time,
        latestEndTime: docData.latest_end_time,
        endIndex: docData.end_index,
        flagged: docData.flagged,
        harassment: docData.harassment,
        harassmentThreatening: docData.harassment_threatening,
        hate: docData.hate,
        hateThreatening: docData.hate_threatening,
        index: docData.index,
        segmentSummary: docData.segment_summary,
        selfHarm: docData.self_harm,
        sexual: docData.sexual,
        sexualMinors: docData.sexual_minors,
        startIndex: docData.start_index,
        transcript: docData.transcript,
        selfHarmIntent: docData.selfHarmIntent,
        videoId: docData.video_id,
        segmentStatus: docData.segment_status,
        shortIdea: docData.short_idea,
        shortIdeaExplanation: docData.short_idea_explanation
    };
}

export function segmentToDocument(segment: Segment): DocumentData {
    return {
        earliest_start_time: segment.earliestStartTime,
        latest_end_time: segment.latestEndTime,
        end_index: segment.endIndex,
        flagged: segment.flagged,
        harassment: segment.harassment,
        harassment_threatening: segment.harassmentThreatening,
        hate: segment.hate,
        hate_threatening: segment.hateThreatening,
        index: segment.index,
        segment_summary: segment.segmentSummary,
        self_harm: segment.selfHarm,
        sexual: segment.sexual,
        sexual_minors: segment.sexualMinors,
        start_index: segment.startIndex,
        transcriptions: segment.transcript,
        self_harm_intent: segment.selfHarmIntent,
        video_id: segment.videoId,
        segment_status: segment.segmentStatus,
        short_idea: segment.shortIdea,
        short_idea_explanation: segment.shortIdeaExplanation
    };
}