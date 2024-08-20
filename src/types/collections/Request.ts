import {Timestamp} from "firebase/firestore";

type RequestOperand = 'video' | 'topical_segment' | 'short';

interface MessageRequests {
  message: string;
  timestamp: Timestamp;
}

export interface Request {
  requestOperand: RequestOperand;
  requestEndpoint: string;
  requestCreated?: Timestamp;
  requestAcknowledgedTimestamp?: Timestamp;
  requestSubmittedTimestamp?: Timestamp;
  serverStartedTimestamp?: Timestamp;
  serverCompletedTimestamp?: Timestamp;
  logs?: MessageRequests[];
  uid?: string;
}

export type ShortRequestEndpoints = "v1/temporal-segmentation" |
  "v1/generate-test-audio" |
  "v1/create-short-video" |
  "v1/get_saliency_for_short" |
  "v1/determine-boundaries" |
  "v1/get-bounding-boxes" |
  "v1/generate-a-roll" |
  "v1/generate-b-roll" |
  "v1/create-cropped-video"

export interface ShortRequest extends Request{
  id?: string;
  requestEndpoint: ShortRequestEndpoints,
  requestOperand: 'short';
  shortId: string;
  uid: string;
  progress?: number;
}


// Doubt i'll need this but let's leave video and segment as is...

type VideoRequestEndpoints = "v1/split-video" | "v1/transcribe" | "v1/begin-youtube-link-download" | "v1/transcribe-and-diarize" | "v1/extract-topical-segments" | "v1/summarise-segments" | "v1/generate-short-ideas"

export interface VideoRequest extends Request {
  requestOperand: 'video';
  requestEndPoint: VideoRequestEndpoints;
}

type TopicalSegmentEndpoints =  "v1/crop-segment" | "v1/generate-short-ideas-for-segment"

export interface TopicalSegmentRequest extends Request {

}