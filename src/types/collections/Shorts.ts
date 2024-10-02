import {doc, DocumentData, Timestamp} from "firebase/firestore";
import FirebaseDatabaseService from "../../services/database/strategies/FirebaseFirestoreService";
import FirebaseStorageService from "../../services/storage/strategies/FirebaseStorageService";
import {BackendServerMetadata} from "./BackendServerMetadata";


export interface Track {
  id: string;
  name: string;
  items: TrackItem[];
}

export interface TrackItem {
  id: string;
  start: number;
  end: number;
  objectMetadata: ImageMetadata | VideoMetadata;
}

export interface BaseMetadata {
  type: 'image' | 'video';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageMetadata extends BaseMetadata {
  type: 'image';
  src: string;
  uploadType: 'link' | 'upload';
}

export interface VideoMetadata extends BaseMetadata {
  type: 'video';
  src: string;
  offset: number; // Start time of the video in seconds
  uploadType: 'link' | 'upload';
}

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

export type TwoBoundingBoxes = {
  boxes: [Boxes, Boxes][];
}


export type VisualDifference = {
  frame_differences: number[]
}

export type SaliencyCaptured = {
  saliency_vals: number[]
}

export interface Word {
  word: string;
  start_time: number;
  end_time: number;
  isKept: boolean;
  color?: string; // Add color property for individual words
}

export interface Line {
  words: Word[];
  y_position: number;
  color?: string; // Add color property for the entire line
}

export interface Short extends BackendServerMetadata{
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
  standard_tiktok?: BoundingBoxes;
  two_boxes?: TwoBoundingBoxes;
  reaction_box?: BoundingBoxes;
  bounding_boxes?: BoundingBoxes,
  half_screen_box?: BoundingBoxes,
  box_type?: string[];
  cuts: number[],
  short_a_roll?: string;
  short_b_roll?: string;
  total_frame_count: number,
  visual_difference?: VisualDifference,
  saliency_values?: SaliencyCaptured,
  finished_short_location: string,
  short_title_top?:string,
  short_title_bottom?: string,
  uid?: string,
  b_roll_tracks?: Track[];
  update_progress: number,
  progress_message: string,
  last_updated: Timestamp,
  pending_operation: boolean,
  background_audio: string,
  background_percentage: number,
  tiktok_link: string,
  auto_generate?: boolean
  lines?: Line[];
  defaultLineColor?: string;
  defaultWordColor?: string;
  context_transcript?: string;
  intro_audio_path?: string;
  intro_video_path?: string;
  likes?: number,
  comments?: number,
  views?: number,
  shares?: number,
  background_video_path?: string,
  transcript_disabled?: boolean,
  selected_box_type?: string,
  tasks_requested?: boolean,
}



export function documentToShort(docData: DocumentData): Short {
  let parsedBoundingBoxes: {
    standard_tiktok?: BoundingBoxes;
    two_boxes?: TwoBoundingBoxes;
    reaction_box?: BoundingBoxes;
    half_screen_box?: BoundingBoxes,
  } | undefined;
  if (docData.bounding_boxes) {
    try {
      const boundingBoxesData = JSON.parse(docData.bounding_boxes);
      parsedBoundingBoxes = {
        standard_tiktok: boundingBoxesData.standard_tiktok ? { boxes: boundingBoxesData.standard_tiktok } : undefined,
        two_boxes: boundingBoxesData.two_boxes ? { boxes: boundingBoxesData.two_boxes } : undefined,
        reaction_box: boundingBoxesData.reaction_box ? { boxes: boundingBoxesData.reaction_box } : undefined,
        half_screen_box: boundingBoxesData.half_screen_box ? { boxes: boundingBoxesData.half_screen_box } : undefined
      };
    } catch (error) {
      console.error("Error parsing bounding boxes:", error);
    }
  }

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
    ...parsedBoundingBoxes,
    box_type: docData.box_type,
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
    b_roll_tracks: docData.b_roll_tracks ? JSON.parse(docData.b_roll_tracks) : undefined,
    short_a_roll: docData.short_a_roll,
    short_b_roll: docData.short_b_roll,
    tiktok_link: docData.tiktok_link,
    auto_generate: docData.auto_generate,
    lines: docData.lines ? docData.lines.map((line: any) => ({
      ...line,
      words: line.words.map((word: any) => ({
        ...word,
        color: word.color || docData.defaultWordColor || "#FFFFFF" // Use default if not set
      })),
      color: line.color || docData.defaultLineColor || "#1FFF01" // Use default if not set
    })) : undefined,
    defaultLineColor: docData.defaultLineColor || "#1FFF01",
    defaultWordColor: docData.defaultWordColor || "#FFFFFF",
    context_transcript: docData.context_transcript,
    intro_audio_path: docData.intro_audio_path,
    intro_video_path: docData.intro_video_path,
    likes: docData.likes,
    comments: docData.comments,
    views: docData.views,
    shares: docData.shares,
    transcript_disabled: docData.transcript_disabled,
    background_video_path: docData.background_video_path,
    selected_box_type: docData.selected_box_type,
    tasks_requested: docData.tasks_requested,
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
            window.location.href = "/dashboard?tab=shorts";
          },
          (error) => {
            console.error("Failed to delete Short:", error.message)
          }
        )

      }
    }
  )
}

