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

export interface WyrVideo {
  id: string;
  title: string;
  styles: number;
  views: number;
  comments: number;
  videoIdeaId: string;
}