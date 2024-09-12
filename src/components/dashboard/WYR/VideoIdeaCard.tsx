import React, {useState} from "react";
import {Niche, VideoIdea, WyrVideo} from "../../../types/collections/Niche";
import {Card, CardContent} from "../../ui/card";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "../../ui/accordion";
import {Sparkles} from "lucide-react";
import {Button} from "../../ui/button";



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


const VideoIdeaCard: React.FC<{ videoIdea: VideoIdea, niche: Niche }> = ({ videoIdea, niche }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`mb-4 rounded-xl  p-[1px]`}
      style={{
        background: `linear-gradient(to right, ${niche.leftColor}, ${niche.rightColor})`
      }}
    >
      <CardContent className={`p-2 bg-background rounded-xl`}>
        <Accordion type="single" collapsible>
          <AccordionItem value={videoIdea.id}>
            <AccordionTrigger onClick={() => setIsExpanded(!isExpanded)}>
              <div className="hover!no-underline flex justify-between items-center w-full px-2">
                <div className="text-left">
                  <span>{videoIdea.title}</span>
                  <p className="text-sm text-gray-600 mb-2 !no-underline">{videoIdea.explanation}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <span>Total Views: {videoIdea.totalViews}</span>
                  <Button variant="outline" size="icon">
                    <Sparkles />
                  </Button>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-2">
              {isExpanded && (
                <div>
                  {
                    wyrVideos
                      .filter((video) => video.videoIdeaId === videoIdea.id)
                      .length > 0 ?
                      <h4 className="font-semibold mt-2 mb-1">WYR Videos:</h4> :
                      <h4 className="font-semibold mt-2 mb-1">No Videos Generated</h4>
                  }
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
    </div>
  );
};

export default VideoIdeaCard;