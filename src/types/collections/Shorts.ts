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
  type: "undelete",
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
  fps: number,
  height: number,
  width: number,
  logs: Logs[],
  segment_id: string,
  transcript: string,
  short_status: string,
  short_idea: string,
  short_idea_explanation: string,
  short_idea_run_id: string,
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
  short_title_top?:string,
  short_title_bottom?: string,
  uid?: string,
  update_progress: number,
  progress_message: string,
  last_updated: Timestamp,
  pending_operation: boolean,
  background_audio: string,
  background_percentage: number,
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
    fps: docData.fps,
    height: docData.height,
    width: docData.width,
    short_status: docData.short_status,
    short_idea: docData.short_idea,
    short_idea_explanation: docData.short_idea_explanation,
    short_idea_run_id: docData.short_idea_run_id,
    video_id: docData.video_id,
    temp_audio_file: docData.temp_audio_file,
    short_clipped_video: docData.short_clipped_video,
    short_video_saliency: docData.short_video_saliency,
    bounding_boxes: docData.bounding_boxes ? JSON.parse(docData.bounding_boxes) : undefined,
    cuts: docData.cuts,
    total_frame_count: docData.total_frame_count,
    visual_difference: docData.visual_difference ? JSON.parse(docData.visual_difference) : undefined,
    saliency_values: docData.saliency_values ? JSON.parse(docData.saliency_values) : undefined,
    finished_short_location: docData.finished_short_location,
    short_title_top: docData.short_title_top,
    short_title_bottom: docData.short_title_bottom,
    uid: docData.uid,
    update_progress: docData.update_progress,
    progress_message: docData.progress_message,
    last_updated: docData.last_updated as Timestamp,
    pending_operation: docData.pending_operation,
    background_audio: docData.background_audio,
    background_percentage: docData.background_percentage,
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

        if (short.temp_audio_file) {
          FirebaseStorageService.deleteFile(short.temp_audio_file);
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
            console.log("Successfully Deleted short!");
          },
          (error) => {
            console.error("Failed to delete Short:", error.message)
          }
        )

      }
    }
  )
}

