import React, { useState, useEffect } from 'react';
import { Short } from "../../types/collections/Shorts";
import { Segment } from "../../types/collections/Segment";
import { Tabs } from "../../pages/Shorts";
import { Tabs as ShadcnTabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import {Button} from "../ui/button";
import FirebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import {useNotification} from "../../contexts/NotificationProvider";
import {ARollTabContent} from "./video-tab/ARollTab";
import {VideoPlayer} from "../video-player/VideoPlayer";

export interface VideoTabProps {
  short: Short;
  shortId: string;
  segment: Segment;
  setTab: React.Dispatch<React.SetStateAction<Tabs>>;
}

type ProcessingStage = {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed';
};

export const VideoTab: React.FC<VideoTabProps> = ({ short, shortId, segment, setTab }) => {
  const [activeTab, setActiveTab] = useState('a-roll');
  const [stages, setStages] = useState<ProcessingStage[]>([
    { id: 'segment', label: 'Clipping Segment', status: 'pending' },
    { id: 'transcript', label: 'Clipping Transcript', status: 'pending' },
    { id: 'saliency', label: 'Determining Regions of Interest', status: 'pending' },
    { id: 'camera', label: 'Finding Camera Cuts', status: 'pending' },
    { id: 'bboxes', label: 'Generating Bounding Box Calculations', status: 'pending' },
  ]);
  const {showNotification} = useNotification();

  useEffect(() => {
    setStages(prevStages => {
      return prevStages.map(stage => {
        switch (stage.id) {
          case 'segment':
            return {
              ...stage,
              status: segment.videoSegmentLocation ? 'completed' : (segment.progress ? 'processing' : 'pending')
            };
          case 'transcript':
            return { ...stage, status: short.short_clipped_video ? 'completed' : (short.short_status === "Create Short Video" ? 'processing' : 'pending') };
          case 'saliency':
            return { ...stage, status: short.short_video_saliency ? 'completed' : (short.short_status === "Generate Saliency" ? 'processing' : 'pending') };
          case 'camera':
            return { ...stage, status: short.cuts && short.cuts.length > 0 ? 'completed': (short.short_status === "Determine Video Boundaries" ? 'processing' : 'pending') };
          case 'bboxes':
            return { ...stage, status: short.bounding_boxes ? 'completed' :  (short.short_status === "Get Bounding Boxes" ? 'processing' : 'pending') };
          default:
            return stage;
        }
      });
    });
  }, [short, segment]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Video Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <ShadcnTabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="a-roll">A-Roll</TabsTrigger>
            <TabsTrigger value="b-roll">B-Roll</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
          </TabsList>
          <TabsContent value="a-roll">
            <ARollTabContent short={short} shortId={shortId} segment={segment} stages={stages} />
          </TabsContent>
          <TabsContent value="b-roll">
            {
              short.short_a_roll ? <div>
                <VideoPlayer path={short.short_a_roll} />
              </div> : <p>
                You need to generate the A-Roll first little man!
              </p>
            }
          </TabsContent>
          <TabsContent value="transcript">Transcript content here</TabsContent>
        </ShadcnTabs>
      </CardContent>
    </Card>
  );
};