import React, { useEffect, useState } from 'react';
import { useShortRequestManagement } from '../../contexts/ShortRequestProvider';
import { ShortRequest } from '../../types/collections/Request';
import { Short } from '../../types/collections/Shorts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { ScrollArea } from "../ui/scroll-area";
import {debounce} from "lodash";
import {useBrowserNotification} from "../../contexts/BrowserNotificationProvider";

interface RequestsTabProps {
  shortId: string;
  short: Short;
}

const formatDuration = (start: Date, end: Date) => {
  const diff = end.getTime() - start.getTime();
  return `${(diff / 1000).toFixed(2)}s`;
};

const RequestCard: React.FC<{ request: ShortRequest }> = ({ request }) => {
  const getStatus = () => {
    if (request.status && request.status == "failed") return "Failed";
    if (request.serverCompletedTimestamp) return 'Completed';
    if (request.serverStartedTimestamp) return 'In Progress';
    if (request.requestSubmittedTimestamp) return 'Submitted';
    if (request.requestAcknowledgedTimestamp) return 'Acknowledged';
    return 'Created';
  };

  const status = getStatus();

  return (
    <Card className={`mb-4 ${request.status && request.status == "failed" && '!border-red-600'}`} >
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{request.requestEndpoint}</CardTitle>
          <Badge variant={status === 'Completed' ? 'default' : 'secondary'}>{status}</Badge>
        </div>
        <CardDescription>Created: {request.requestCreated?.toDate().toLocaleString()}, {request.id? request.id : ''}</CardDescription>
      </CardHeader>
      <CardContent>
        {request.status && request.status == "failed" && <p className="bg-destructive">Request Failed. Check logs below. Email me if the error isn't clear.</p>}
        <div className="mb-4">
          <Progress value={request.progress || 0} className="w-full" />
          <p className="text-sm text-right mt-1">{request.progress || 0}% Complete</p>
        </div>
        <div className="space-y-2">
          {request.requestCreated && request.requestAcknowledgedTimestamp && (
            <p><span className="font-semibold">Acknowledged:</span> {formatDuration(request.requestCreated!.toDate(), request.requestAcknowledgedTimestamp.toDate())}</p>
          )}
          {request.requestAcknowledgedTimestamp && request.requestSubmittedTimestamp && (
            <p><span className="font-semibold">Submitted:</span> {formatDuration(request.requestAcknowledgedTimestamp!.toDate(), request.requestSubmittedTimestamp.toDate())}</p>
          )}
          {request.requestSubmittedTimestamp && request.serverStartedTimestamp && (
            <p><span className="font-semibold">Started:</span> {formatDuration(request.requestSubmittedTimestamp!.toDate(), request.serverStartedTimestamp.toDate())}</p>
          )}
          {request.serverStartedTimestamp && request.serverCompletedTimestamp && (
            <p><span className="font-semibold">Completed:</span> {formatDuration(request.serverStartedTimestamp!.toDate(), request.serverCompletedTimestamp.toDate())}</p>
          )}
        </div>
        {request.logs && request.logs.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Logs:</h4>
            <ScrollArea className="h-40 rounded-md border p-4">
              {request.logs.map((log, index) => (
                <div key={index} className="mb-2">
                  <span className="text-sm text-muted-foreground">{log.timestamp.toDate().toLocaleString()}: </span>
                  <span>{log.message}</span>
                </div>
              ))}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const RequestsTab: React.FC<RequestsTabProps> = ({ shortId, short }) => {
  const [requests, setRequests] = useState<ShortRequest[]>([]);
  const { getShortRequests } = useShortRequestManagement();
  const { notifyRequestCompleted } = useBrowserNotification();

  useEffect(() => {
    const debouncedFetch = debounce(async () => {
      try {
        const fetchedRequests = await new Promise<ShortRequest[]>((resolve, reject) =>
          getShortRequests(shortId, resolve, reject)
        );

        fetchedRequests.forEach(request => {
          const existingRequest = requests.find(r => r.id === request.id);
          if (request.serverCompletedTimestamp &&
            (!existingRequest || !existingRequest.serverCompletedTimestamp)) {
            notifyRequestCompleted(request);
          }
        });

        setRequests(fetchedRequests);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
      }
    }, 300); // 300ms debounce

    debouncedFetch();

    return () => {
      debouncedFetch.cancel();
    };
  }, [shortId, getShortRequests]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-white">Requests for {short.short_idea}</h2>
      {requests.length === 0 ? (
        <p>No requests found for this short.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request, index) => (
            <RequestCard key={index} request={request} />
          ))}
        </div>
      )}
    </div>
  );
};