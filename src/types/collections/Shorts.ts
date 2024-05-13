import {doc, DocumentData, Timestamp} from "firebase/firestore";

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
    temp_audio_file: docData.temp_audio_file
  };
}
