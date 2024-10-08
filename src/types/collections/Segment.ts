import {DocumentData} from "firebase/firestore";
import FirebaseDatabaseService from "../../services/database/strategies/FirebaseFirestoreService";
import {deleteShort, documentToShort, Short} from "./Shorts";
import {FirebaseStorageService} from "../../services/storage/strategies";
import { BackendServerMetadata } from "./BackendServerMetadata";

export interface Word {
    start_time: number;
    end_time: number;
    index: number;
    confidence: number;
    word: string;
}

export interface Segment extends BackendServerMetadata {
    id: string;
    earliestStartTime: number;
    endIndex: number;
    flagged: boolean;
    harassment: boolean;
    harassmentThreatening: boolean;
    hate: boolean;
    hateThreatening: boolean;
    index: number;
    segmentTitle: string;
    segmentSummary: string;
    selfHarm: boolean;
    sexual: boolean;
    sexualMinors: boolean;
    startIndex: boolean;
    transcript: string;
    latestEndTime: number;
    selfHarmIntent: string;
    videoId: string;
    previousSegmentStatus: string;
    segmentStatus: string;
    shortIdea: string;
    shortIdeaExplanation: string;
    shortRunId: string;
    progress?: number;
    videoSegmentLocation: string;
    words: Word[];
}

function fixStringRepresentation(inputString: string): any {
    if (typeof inputString !== 'string') {
        console.error("Input is not a string:", inputString);
        return [];
    }

    // Remove any leading/trailing whitespace
    inputString = inputString.trim();

    // Handle the case where the string is wrapped in parentheses and quotes
    if (inputString.startsWith('("') && inputString.endsWith('")')) {
        inputString = inputString.slice(2, -2);
    }

    // If it's already a valid JSON, parse it directly
    if (inputString.startsWith('[') && inputString.endsWith(']')) {
        try {
            return JSON.parse(inputString);
        } catch (error) {
            console.error("Failed to parse JSON array:", error);
        }
    }

    // If it's a string representation of an object, try to parse it
    if (inputString.startsWith('{') && inputString.endsWith('}')) {
        try {
            return JSON.parse(inputString);
        } catch (error) {
            console.error("Failed to parse JSON object:", error);
        }
    }

    // If it's wrapped in quotes, remove them and try to parse as a JavaScript array literal
    if (inputString.startsWith('"') && inputString.endsWith('"')) {
        const cleanedString = inputString.slice(1, -1)
          .replace(/\\'/g, "'")
          .replace(/\\"/g, '"');
        try {
            // Use Function constructor to safely evaluate the string as a JavaScript array literal
            return Function(`'use strict'; return [${cleanedString}];`)();
        } catch (error) {
            console.error("Failed to parse cleaned string as array literal:", error);
        }
    }

    // As a last resort, try to evaluate the string (be cautious with this approach)
    try {
        return eval(`(${inputString})`);
    } catch (error) {
        console.error("Failed to evaluate string:", error);
    }

    // If all parsing attempts fail, return an empty array
    console.error("Unable to parse string:", inputString);
    return [];
}

function parseSegmentWords(segmentDocument: DocumentData): Word[] {
    try {
        if (typeof segmentDocument.words === 'string') {
            return fixStringRepresentation(segmentDocument.words);
        } else if (Array.isArray(segmentDocument.words)) {
            return segmentDocument.words;
        } else {
            console.error("Unexpected words format", segmentDocument.words);
            return [];
        }
    } catch (error) {
        console.error("Error parsing segment words:", error);
        console.error("Problematic string:", segmentDocument.words?.slice(0, 100));
        return [];
    }
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
        segmentTitle: docData.segment_title,
        selfHarm: docData.self_harm,
        sexual: docData.sexual,
        sexualMinors: docData.sexual_minors,
        startIndex: docData.start_index,
        transcript: docData.transcript,
        selfHarmIntent: docData.self_harm_intent,
        videoId: docData.video_id,
        segmentStatus: docData.segment_status,
        previousSegmentStatus: docData.previous_segment_status,
        shortIdea: docData.short_idea,
        shortIdeaExplanation: docData.short_idea_explanation,
        shortRunId: docData.short_idea_run_id,
        videoSegmentLocation: docData.video_segment_location,
        progress: docData.progress,
        words: parseSegmentWords(docData)
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
        segment_title: segment.segmentTitle,
        self_harm: segment.selfHarm,
        sexual: segment.sexual,
        sexual_minors: segment.sexualMinors,
        start_index: segment.startIndex,
        transcriptions: segment.transcript,
        self_harm_intent: segment.selfHarmIntent,
        video_id: segment.videoId,
        previous_segment_status: segment.previousSegmentStatus,
        segment_status: segment.segmentStatus,
        short_idea: segment.shortIdea,
        short_idea_explanation: segment.shortIdeaExplanation,
        short_run_id: segment.shortRunId,
        video_segment_location: segment.videoSegmentLocation,
        progress: segment.progress,
    };
}

export const deleteSegment = (segmentId: string) => {
    FirebaseDatabaseService.getDocument(
      "topical_segments",
      segmentId,
      (data) => {
          if (data) {
              const segment: Segment = documentToSegment(data);
              if (segment.videoSegmentLocation) {
                FirebaseStorageService.deleteFile(segment.videoSegmentLocation)
              }

              // Delete the segment video
              FirebaseDatabaseService.queryDocuments(
                "shorts",
                "segment_id",
                segmentId,
                "start_index",
                (tempShorts) => {
                    for (let tempShort of tempShorts){
                        if (tempShort) {
                            const short: Short = documentToShort(tempShort);
                            deleteShort(short.id);
                        }
                    }

                    FirebaseDatabaseService.deleteDocument(
                      "topical_segments",
                      segmentId,
                      () => {
                          console.log("Successfully deleted segment")
                      },
                      () => {
                          console.error("Failed to delete segment")
                      }
                    )
                },(error)=>{
                    console.log(`Error... ${error}`)
                }
              )
          }
      }
    )
}