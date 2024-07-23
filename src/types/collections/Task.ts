import {Timestamp} from "firebase/firestore";

type TaskStatus = 'Pending' | 'Running' | 'Complete' | 'Failed'
type TaskOperation = 'Analytics';

export interface Task {
  status: TaskStatus;
  scheduledTime: Timestamp;
  operation: TaskOperation;
  taskResultId: string;
  shortId: string;
  tikTokLink: string;
}