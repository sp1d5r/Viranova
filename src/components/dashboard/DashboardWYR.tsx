import React, { useState } from 'react';
import {PlusCircle, Terminal} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { Card, CardContent } from "../ui/card"
import {Alert, AlertDescription, AlertTitle} from "../ui/alert";

// Types
type Niche = {
  id: string;
  name: string;
  color: string;
};

type VideoIdea = {
  id: string;
  title: string;
  explanation: string;
  nicheId: string;
  totalViews: number;
};

type WyrVideo = {
  id: string;
  title: string;
  styles: number;
  views: number;
  comments: number;
  videoIdeaId: string;
};

// Mock data
const niches: Niche[] = [
  { id: '1', name: 'Fashion', color: 'bg-gradient-to-r from-green-400 to-blue-500' },
  { id: '2', name: 'Basketball', color: 'bg-gradient-to-r from-orange-400 to-pink-500' },
];

const videoIdeas: VideoIdea[] = [
  {
    id: '1',
    title: 'Fashion Faux Pas Fix',
    explanation: 'Focuses on correcting fashion mistakes, e.g., "Fix a too-tight dress or a mismatched color outfit?"',
    nicheId: '1',
    totalViews: 500,
  },
  {
    id: '2',
    title: 'Decade Style Swap',
    explanation: 'Explores swapping styles from different decades, e.g., "1970s boho or 1990s grunge?"',
    nicheId: '1',
    totalViews: 300,
  },
  {
    id: '3',
    title: 'Runway Showdown',
    explanation: 'Presents choices between different runway looks, e.g., "Couture gown or avant-garde outfit?"',
    nicheId: '1',
    totalViews: 400,
  },
];

const wyrVideos: WyrVideo[] = [
  {
    id: '1',
    title: 'Decade Style Swap - Streetwear!!',
    styles: 3,
    views: 300,
    comments: 10,
    videoIdeaId: '2',
  },
];

// Components
const NicheButton: React.FC<{ niche: Niche }> = ({ niche }) => (
  <button className={`${niche.color} text-white font-semibold py-2 px-4 rounded-full`}>
    {niche.name}
  </button>
);

const VideoIdeaCard: React.FC<{ videoIdea: VideoIdea }> = ({ videoIdea }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <Accordion type="single" collapsible>
          <AccordionItem value={videoIdea.id}>
            <AccordionTrigger onClick={() => setIsExpanded(!isExpanded)}>
              <div className="flex justify-between w-full">
                <span>{videoIdea.title}</span>
                <span>Total Views: {videoIdea.totalViews}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-gray-600 mb-2">{videoIdea.explanation}</p>
              {isExpanded && (
                <div>
                  <h4 className="font-semibold mt-2 mb-1">WYR Videos:</h4>
                  {wyrVideos
                    .filter((video) => video.videoIdeaId === videoIdea.id)
                    .map((video) => (
                      <div key={video.id} className="text-sm">
                        <p>{video.title}</p>
                        <p>Styles: {video.styles} | Views: {video.views} | Comments: {video.comments}</p>
                      </div>
                    ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

const DashboardWYR: React.FC = () => {
  return (
    <div className="p-4 md:p-8 max-w-[100vw]">
      <Alert className="my-2">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Feature in Beta</AlertTitle>
        <AlertDescription>
          This feature is currently under development, this type of content has been quite popular recently so will try and push this out immediately.
        </AlertDescription>
      </Alert>
      <h1 className="text-2xl font-bold mb-4">Would You Rather</h1>
      <p className="mb-4">A new popular format for TikTok videos used to drive engagement. Pick a Niche and then create videos around that niche.</p>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Niche</h2>
        <div className="flex space-x-2">
          <button className="border border-gray-300 rounded-full p-2">
            <PlusCircle className="h-6 w-6" />
          </button>
          {niches.map((niche) => (
            <NicheButton key={niche.id} niche={niche} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Video Ideas</h2>
        {videoIdeas.map((idea) => (
          <VideoIdeaCard key={idea.id} videoIdea={idea} />
        ))}
      </div>
    </div>
  );
};

export default DashboardWYR;
