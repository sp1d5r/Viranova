import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Button } from "../../../ui/button";
import {CheckCircle2, Circle, Loader2, Terminal} from "lucide-react";
import FirebaseFirestoreService from "../../../../services/database/strategies/FirebaseFirestoreService";
import { useNotification } from "../../../../contexts/NotificationProvider";
import { Short } from "../../../../types/collections/Shorts";
import { Segment } from "../../../../types/collections/Segment";
import {BoundingBoxSuggestions} from "./BoundingBoxSuggestion";
import {LoadingIcon} from "../../../loading/Loading";
import {Alert, AlertDescription, AlertTitle} from "../../../ui/alert";
import {useShortRequestManagement} from "../../../../contexts/ShortRequestProvider";
import {CreditButton} from "../../../ui/credit-button";

type ProcessingStage = {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed';
};

interface ARollTabContentProps {
  short: Short;
  shortId: string;
  segment: Segment;
  stages: ProcessingStage[];
}

export const ARollTabContent: React.FC<ARollTabContentProps> = ({ short, shortId, segment, stages }) => {
  const { showNotification } = useNotification();
  const { createShortRequest } = useShortRequestManagement();

  const handleBeginProcessing = () => {
    createShortRequest(
      shortId,
      "v1/create-short-video",
      5,
      (requestId) => {
        showNotification("Crop Short Video", `Request ID: ${requestId}`, "success");
      },
      (error) => {
        showNotification("Crop Short Video Failed", `${error}`, "error");
      }
    );
  };

  if (stages[0].status === 'completed' && stages[1].status === 'pending') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>Are you happy with the transcript created? If so you can begin the visual processing stages</p>
            <p>This will prepare you for creating the visual part of your video</p>
            <Button onClick={handleBeginProcessing} cooldown={100}>
              Begin
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (stages[stages.length - 1].status !== 'completed') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
        </CardContent>
      </Card>
    );
  }

  if (short.pending_operation) {
    return <LoadingIcon id={"something"} text={"Performing Operation"} className="my-10"/>
  }
  return <div>
    <Alert>
      <Terminal className="h-4 w-4" />
      <AlertTitle>Something Broken?</AlertTitle>
      <AlertDescription>
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
          <div>
            This feature is still in beta, email me if you need help - {' '}
            <a className="text-primary underline" href="mailto:elijahahmad03@gmail.com">elijahahmad03@gmail.com</a>.
          </div>
          <CreditButton
            variant={"outline"}
            creditCost={5}
            confirmationMessage={"Regenerating the process will cost 5 credits to complete."}
            cooldown={200} onClick={() => {
            handleBeginProcessing()
          }}>
            Regenerate...
          </CreditButton>
        </div>
      </AlertDescription>
    </Alert>
    <BoundingBoxSuggestions short={short} shortId={shortId}/>
  </div>
};