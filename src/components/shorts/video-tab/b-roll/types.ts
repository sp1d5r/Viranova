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

interface BaseMetadata {
  type: 'image' | 'video';
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageMetadata extends BaseMetadata {
  type: 'image';
  src: string;
}

interface VideoMetadata extends BaseMetadata {
  type: 'video';
  src: string;
  offset: number; // Start time of the video in seconds
}