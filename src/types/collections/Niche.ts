export interface Niche {
  id: string;
  name: string;
  leftColor: string;
  rightColor: string;
}

export interface VideoIdea {
  id: string;
  title: string;
  explanation: string;
  nicheId: string;
  totalViews: number;
}

export interface WyrVideo {
  id: string;
  title: string;
  styles: number;
  views: number;
  comments: number;
  videoIdeaId: string;
}