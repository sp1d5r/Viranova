import {doc, DocumentData, Timestamp} from "firebase/firestore";
import firebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import FirebaseDatabaseService from "../../services/database/strategies/FirebaseFirestoreService";
import FirebaseStorageService from "../../services/storage/strategies/FirebaseStorageService";

export type Logs = {
  type: "message",
  message: string,
  time: Timestamp,
} | {
  type: "delete",
  message: string,
  start_index: number,
  end_index: number,
  time: Timestamp
} | {
  type: "success",
  message: string,
  time: Timestamp
} | {
  type: "error",
  message: string,
  time: Timestamp,
}

export type Boxes = [number, number, number, number];

export type BoundingBoxes = {
  boxes: Boxes[];
}

export type VisualDifference = {
  frame_differences: number[]
}

export type SaliencyCaptured = {
  saliency_vals: number[]
}

export interface Short {
  id: string,
  start_index: number,
  end_index: number,
  error_count: number,
  logs: Logs[],
  segment_id: string,
  transcript: string,
  short_status: string,
  short_idea: string,
  short_idea_explanation: string,
  video_id: string,
  temp_audio_file: string,
  short_clipped_video: string,
  short_video_saliency: string,
  bounding_boxes?: BoundingBoxes,
  cuts: number[],
  total_frame_count: number,
  visual_difference?: VisualDifference,
  saliency_values?: SaliencyCaptured,
  finished_short_location: string,
}



export function documentToShort(docData: DocumentData): Short {
  return {
    id: docData.id,
    start_index: docData.start_index,
    end_index: docData.end_index,
    error_count: docData.error_count,
    logs: docData.logs.map((doc: any) => {return doc as Logs}),
    segment_id: docData.segment_id,
    transcript: docData.transcript,
    short_status: docData.short_status,
    short_idea: docData.short_idea,
    short_idea_explanation: docData.short_idea_explanation,
    video_id: docData.video_id,
    temp_audio_file: docData.temp_audio_file,
    short_clipped_video: docData.short_clipped_video,
    short_video_saliency: docData.short_video_saliency,
    bounding_boxes: docData.bounding_boxes ? JSON.parse(docData.bounding_boxes) : undefined,
    cuts: docData.cuts,
    total_frame_count: docData.total_frame_count,
    visual_difference: docData.visual_difference ? JSON.parse(docData.visual_difference) : undefined,
    saliency_values: docData.saliency_values ? JSON.parse(docData.saliency_values) : undefined,
    finished_short_location: docData.finished_short_location
  };
}


export const deleteShort = (shortId: string) => {
  FirebaseDatabaseService.getDocument(
    "shorts",
    shortId,
    (data) => {
      if (data) {
        const short : Short = documentToShort(data);


        // Delete the corresponding files stored on the document
        if (short.short_clipped_video) {
          FirebaseStorageService.deleteFile(short.short_clipped_video);
        }

        if (short.short_video_saliency) {
          FirebaseStorageService.deleteFile(short.short_video_saliency);
        }

        if (short.finished_short_location) {
          FirebaseStorageService.deleteFile(short.finished_short_location);
        }


        FirebaseDatabaseService.deleteDocument(
          "shorts",
          shortId,
          () => {
            console.log("Successfully Deleted short!")
          },
          (error) => {
            console.error("Failed to delete Short:", error.message)
          }
        )

      }
    }
  )
}