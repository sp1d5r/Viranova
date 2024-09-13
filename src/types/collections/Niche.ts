import {Timestamp} from "firebase/firestore";

export interface Niche {
  id?: string;
  name: string;
  leftColor: string;
  rightColor: string;
  createdAt: Date;
  uid: string;
  // Temporary data points
  prompt?: string;
  numberOfIdeas?: number;
  status?: string;
}

export interface VideoIdea {
  id?: string,
  createdAt: Date,
  explanation: string,
  nicheId: string,
  requestId: string,
  status: string;
  theme: string;
  totalViews?: number
}

export interface OptionSet {
  transcript: string,
  option1: string,
  option1_percentage: number,
  option2: string,
}

export interface WyrVideo {
  id?: string;
  createdAt: Timestamp,
  explanation: string,
  ideaId: string,
  nicheId: string,
  optionSets: OptionSet[],
  theme: string,
  uid: string,
  updatedAt: Date,
}