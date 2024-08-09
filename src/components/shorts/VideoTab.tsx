import React, { useState, useEffect } from 'react';
import { Short } from "../../types/collections/Shorts";
import { Segment } from "../../types/collections/Segment";
import { Tabs as ShadcnTabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {ARollTabContent} from "./video-tab/a-roll/ARollTab";
import BRollTab from "./video-tab/b-roll/BRollTab";
import {TranscriptTab} from "./video-tab/transcript/Transcript";

export interface VideoTabProps {
  short: Short;
  shortId: string;
  segment: Segment;
}

type ProcessingStage = {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed';
};

export const VideoTab: React.FC<VideoTabProps> = ({ short, shortId, segment }) => {
  const [activeTab, setActiveTab] = useState('a-roll');
  const [stages, setStages] = useState<ProcessingStage[]>([
    { id: 'segment', label: 'Clipping Segment', status: 'pending' },
    { id: 'transcript', label: 'Clipping Transcript', status: 'pending' },
    { id: 'saliency', label: 'Determining Regions of Interest', status: 'pending' },
    { id: 'camera', label: 'Finding Camera Cuts', status: 'pending' },
    { id: 'bboxes', label: 'Generating Bounding Box Calculations', status: 'pending' },
  ]);

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
    <Card className="w-full ">
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
            <BRollTab short={short} shortId={shortId} />
          </TabsContent>
          <TabsContent value="transcript">
            <TranscriptTab short={short} shortId={shortId} segment={segment} />
          </TabsContent>
        </ShadcnTabs>
      </CardContent>
    </Card>
  );
};