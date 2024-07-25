import {Timestamp} from "firebase/firestore";

type TaskStatus = 'Pending' | 'Running' | 'Complete' | 'Failed'
type TaskOperation = 'Analytics';

export interface Task {
  status: TaskStatus;
  scheduledTime: Timestamp;
  operation: TaskOperation;
  processingStartTime?: Timestamp;
  taskResultId: string;
  shortId: string;
  tikTokLink: string;
}