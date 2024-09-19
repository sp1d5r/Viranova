import {Timestamp} from "firebase/firestore";

type TaskStatus = 'Pending' | 'Running' | 'Complete' | 'Failed';
type TaskOperation = 'Analytics' | 'Download' | 'Re-Subscribe';

interface BaseTask {
  id?: string; // Unique identifier for the task
  status: TaskStatus;
  scheduledTime: Timestamp;
  operation: TaskOperation;
  processingStartTime?: Timestamp;
  processingEndTime?: Timestamp;
  error?: string; // To store error messages if the task fails
}

export interface AnalyticsTask extends BaseTask {
  operation: 'Analytics';
  taskResultId: string;
  shortId: string;
  tikTokLink: string;
}

export interface DownloadTask extends BaseTask {
  operation: 'Download';
  videoId: string; // YouTube video ID
  channelId: string; // YouTube channel ID
  downloadUrl?: string; // URL where the video was downloaded to
  fileSize?: number; // Size of the downloaded video in bytes
}


export interface ResubscribeTask extends BaseTask {
  operation: 'Re-Subscribe';
  channelId: string;
}

export type Task = AnalyticsTask | DownloadTask;

// Type guard functions
export function isAnalyticsTask(task: Task): task is AnalyticsTask {
  return task.operation === 'Analytics';
}

export function isDownloadTask(task: Task): task is DownloadTask {
  return task.operation === 'Download';
}