import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Timestamp } from "firebase/firestore";
import { Short } from "../../../types/collections/Shorts";
import FirebaseFirestoreService from "../../../services/database/strategies/FirebaseFirestoreService";
import { useNotification } from "../../../contexts/NotificationProvider";
import { CheckCircle2, Loader2, Circle } from 'lucide-react';
import { RequestsTab } from './RequestsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";

interface ProcessingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  short: Short;
  shortId: string;
}

type ProcessingStage = {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed';
};

export const ProcessingDialog: React.FC<ProcessingDialogProps> = ({
                                                                    isOpen,
                                                                    onClose,
                                                                    short,
                                                                    shortId,
                                                                  }) => {
  const { showNotification } = useNotification();
  const [stages, setStages] = useState<ProcessingStage[]>([
    { id: 'edit_transcript', label: 'Edit Transcript', status: 'pending' },
    { id: 'generate_audio', label: 'Generate Audio', status: 'pending' },
    { id: 'crop_clip', label: 'Cropping Clip', status: 'pending' },
    { id: 'visual_interest', label: 'Getting Visual Interest', status: 'pending' },
    { id: 'camera_cuts', label: 'Determining Camera Cuts', status: 'pending' },
    { id: 'bounding_boxes', label: 'Find Bounding Boxes', status: 'pending' },
    { id: 'generate_a_roll', label: 'Generate A-Roll', status: 'pending' },
    { id: 'generate_final_clip', label: 'Generate Final Clip', status: 'pending' },
  ]);

  useEffect(() => {
    setStages(prevStages => {
      return prevStages.map(stage => {
        switch (stage.id) {
          case 'edit_transcript':
            return { ...stage, status: short.logs && short.logs.length > 0 && (short.logs[short.logs.length - 1].type === 'success' || short.error_count >= 5) ? 'completed' : 'processing' };
          case 'generate_audio':
            return { ...stage, status: short.temp_audio_file ? 'completed' : 'processing' };
          case 'crop_clip':
            return { ...stage, status: short.short_clipped_video ? 'completed' : 'processing' };
          case 'visual_interest':
            return { ...stage, status: short.short_video_saliency ? 'completed' : 'processing' };
          case 'camera_cuts':
            return { ...stage, status: short.cuts && short.cuts.length > 0 ? 'completed' : 'processing' };
          case 'bounding_boxes':
            return { ...stage, status: short.bounding_boxes ? 'completed' : 'processing' };
          case 'generate_a_roll':
            return { ...stage, status: short.short_a_roll ? 'completed' : 'processing' };
          case 'generate_final_clip':
            return { ...stage, status: short.finished_short_location ? 'completed' : 'processing' };
          default:
            return stage;
        }
      });
    });
  }, [short]);

  const isOlderThanFiveMinutes = short.last_updated
    ? (Timestamp.now().seconds - short.last_updated.seconds) / 60 > 5
    : false;

  const handleCancelOperation = () => {
    FirebaseFirestoreService.updateDocument(
      "shorts",
      shortId,
      {
        backend_status: "Completed",
        pending_operation: false,
      },
      () => {
        showNotification("Cancelled Operation", "Be careful of concurrency errors.", "success");
        onClose();
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Auto-Generate Requested</DialogTitle>
          <DialogDescription>Please wait while the operation completes. You will be notified (hopefully).</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="flex flex-col gap-2">
              {stages.map((stage) => (
                <div key={stage.id} className="flex items-center space-x-2">
                  {stage.status === 'completed' && <CheckCircle2 className="text-green-500" />}
                  {stage.status === 'processing' && <Loader2 className="animate-spin text-blue-500" />}
                  {stage.status === 'pending' && <Circle className="text-gray-300" />}
                  <span
                    className={`${stage.status === 'completed' ? 'text-green-500' : stage.status === 'processing' ? 'text-blue-500' : 'text-gray-500'}`}>
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>{short.progress_message}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-secondary rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${short.update_progress}%` }}
                  ></div>
                </div>
                {isOlderThanFiveMinutes && (
                  <Button
                    onClick={handleCancelOperation}
                    className="mt-4"
                    variant="destructive"
                  >
                    Cancel Operation
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="requests">
            <RequestsTab shortId={shortId} short={short} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};