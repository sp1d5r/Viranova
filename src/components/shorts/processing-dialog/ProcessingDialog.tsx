import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog";
import {Card, CardContent, CardDescription, CardHeader } from "../../ui/card";
import { Button } from "../../ui/button";
import { Timestamp } from "firebase/firestore";
import { Short } from "../../../types/collections/Shorts";
import FirebaseFirestoreService from "../../../services/database/strategies/FirebaseFirestoreService";
import { useNotification } from "../../../contexts/NotificationProvider";
import { RequestsTab } from '../../shorts/RequestsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { ShortRequest, } from '../../../types/collections/Request';
import { StageInfo } from './StageInfo';
import { ProcessingStage } from '../../../pages/Shorts';

interface ProcessingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  short: Short;
  shortId: string;
  stages: ProcessingStage[];
  requests: ShortRequest[];
}

export const ProcessingDialog: React.FC<ProcessingDialogProps> = ({
                                                                    isOpen,
                                                                    onClose,
                                                                    short,
                                                                    shortId,
                                                                    stages,
                                                                    requests
                                                                  }) => {
  const { showNotification } = useNotification();

  const isOlderThanFiveMinutes = short.last_updated
    ? (Timestamp.now().seconds - short.last_updated.seconds) / 60 > 5
    : false;

  const handleCancelOperation = () => {
    FirebaseFirestoreService.updateDocument<Short>(
      "shorts",
      shortId,
      {
        backend_status: "Completed",
        pending_operation: false,
        auto_generate: false
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
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <DialogTitle className="text-white">Auto-Generate Requested</DialogTitle>
              <DialogDescription>Please wait while the operation completes. You will be notified (hopefully).</DialogDescription>
            </div>
            <div className="flex gap-2">
              <a href={`/dashboard?tab=videos&expanded=${short.video_id}`}>
                <Button variant="outline" className="text-white">
                  Videos
                </Button>
              </a>
              <a href={`/dashboard?tab=short`}>
                <Button>
                  Shorts
                </Button>
              </a>
            </div>
          </div>
        </DialogHeader>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="flex flex-col gap-2 p-2">
            {stages.map((stage, index) => (
                <StageInfo 
                  key={stage.id} 
                  stage={stage} 
                />
              ))}
            </div>
            <Card className="mt-4">
              <CardHeader>
                <CardDescription>{short.progress_message}</CardDescription>
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