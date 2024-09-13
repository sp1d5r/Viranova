import React, {useEffect, useState} from "react";
import {Niche, VideoIdea, WyrVideo} from "../../../types/collections/Niche";
import {Card, CardContent} from "../../ui/card";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "../../ui/accordion";
import {ExternalLink, Sparkles, TrashIcon} from "lucide-react";
import {Button} from "../../ui/button";
import FirebaseFirestoreService from "../../../services/database/strategies/FirebaseFirestoreService";
import {useNotification} from "../../../contexts/NotificationProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import {useWouldYouRatherRequestManagement} from "../../../contexts/WYRRequestProvider";


const VideoIdeaCard: React.FC<{ videoIdea: VideoIdea, niche: Niche }> = ({ videoIdea, niche }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [wyrVideos, setWyrVideos] = useState<WyrVideo[]>([])
  const {showNotification} = useNotification();
  const { createWouldYouRatherRequest } = useWouldYouRatherRequestManagement();

  useEffect(() => {
    if (videoIdea.id) {
      FirebaseFirestoreService.listenToQuery<WyrVideo>(
        'wyr-videos',
        'ideaId',
        videoIdea.id,
        "createdAt",
        (collectedWyrVideos) => {
          console.log(collectedWyrVideos)
          if (collectedWyrVideos) {
            setWyrVideos(collectedWyrVideos);
          }
        },
        (error) => {
          console.log(error);
          showNotification('Failed', 'Unable to collect wyrVideos', 'error');
        }
      )
    }
  },[videoIdea])

  return (
    <div
      className={`mb-4 rounded-xl  p-[1px]`}
      style={{
        background: `linear-gradient(to right, ${niche.leftColor}, ${niche.rightColor})`
      }}
    >
      <CardContent className={`p-2 bg-background rounded-xl`}>
        <Accordion type="single" collapsible>
          <AccordionItem value={videoIdea.id!}>
            <AccordionTrigger onClick={() => setIsExpanded(!isExpanded)}>
              <div className="hover!no-underline flex justify-between items-center w-full px-2">
                <div className="text-left">
                  <span>{videoIdea.theme}</span>
                  <p className="text-sm text-gray-600 mb-2 !no-underline">{videoIdea.explanation}</p>
                </div>
                <div className="flex flex-col gap-2 items-center">
                  <span>Total Views: {videoIdea.totalViews || 0}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        createWouldYouRatherRequest(
                          videoIdea.nicheId,
                          "v1/new-wyr-video",
                          0,
                          (requestId) => {
                            showNotification("New WYR video created", `Created new video request: ${requestId}`, "info");
                          },
                          () => {
                            showNotification("Failed to create WYR", "Failed to create request", "error");
                          },
                          videoIdea.id!
                        )
                      }}
                    >
                      <Sparkles />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => {
                      FirebaseFirestoreService.deleteDocument(
                        "wyr-themes",
                        videoIdea.id!,
                        () => {
                          showNotification("Deleted video idea", "Successfully deleted video idea", "success")
                        }
                      )
                    }}>
                      <TrashIcon />
                    </Button>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-2">
              {isExpanded && (
                <div>
                  {wyrVideos.length > 0 ? (
                    <>
                      <h4 className="font-semibold mt-2 mb-1">WYR Videos:</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Theme</TableHead>
                            <TableHead>Explanation</TableHead>
                            <TableHead>Creation Date</TableHead>
                            <TableHead>Link</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {wyrVideos.map((video) => (
                            <TableRow key={video.id}>
                              <TableCell>{video.theme}</TableCell>
                              <TableCell>{video.explanation}</TableCell>
                              <TableCell>{video.createdAt.toDate().toString()}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    window.open(`/wyr-videos/${video.id}`, '_blank');
                                  }}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </>
                  ) : (
                    <h4 className="font-semibold mt-2 mb-1">No Videos Generated</h4>
                  )}
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