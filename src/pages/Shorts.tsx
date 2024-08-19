import React, {useCallback, useEffect, useState, useRef} from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ShortSettingsTab } from "../components/shorts/ShortSettingsTab";
import { TranscriptEditorTab } from "../components/shorts/TranscriptEditorTab";
import { VideoTab } from "../components/shorts/VideoTab";
import { ExportTab } from "../components/shorts/ExportTab";
import { PerformanceTab } from "../components/shorts/PerformanceTab";
import { LoadingIcon } from "../components/loading/Loading";
import FirebaseFirestoreService from "../services/database/strategies/FirebaseFirestoreService";
import { useNotification } from "../contexts/NotificationProvider";
import { documentToShort, Short } from "../types/collections/Shorts";
import { documentToSegment, Segment } from "../types/collections/Segment";
import { Timestamp } from "firebase/firestore";
import ScrollableLayout from "../layouts/ScrollableLayout";
import {RequestsTab} from "../components/shorts/RequestsTab";
import {ProcessingDialog} from "../components/shorts/processing-dialog/ProcessingDialog";

export type TabType = "short-settings" | "transcript-editor" | "attention-capture" | "export" | "performance" | "requests";

const tabConfig: { value: TabType; title: string; description: string; icon: React.ReactNode }[] = [
  { value: "short-settings", title: "Short Settings", description: "Configure your short video settings", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { value: "transcript-editor", title: "Transcript Editor", description: "Edit and refine your video transcript", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
  { value: "attention-capture", title: "Attention Capture", description: "Enhance viewer engagement", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> },
  { value: "export", title: "Export", description: "Prepare your short for publishing", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> },
  { value: "performance", title: "Performance", description: "Track your short's performance", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
  { value: "requests", title: "Requests", description: "Manage requests for this short", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
];

export const Shorts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const short_id = searchParams.get("short_id");
  const [short, setShort] = useState<Short | undefined>();
  const [segment, setSegment] = useState<Segment | undefined>();
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const initialTab = (searchParams.get("tab") as TabType) || "short-settings";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  useEffect(() => {
    let unsubscribeShort: (() => void) | undefined;
    let unsubscribeSegment: (() => void) | undefined;

    if (short_id) {
      unsubscribeShort = FirebaseFirestoreService.listenToDocument(
        "shorts",
        short_id,
        (document) => {
          if (document) {
            const updatedShort = documentToShort(document);
            setShort(updatedShort);

            // Setup segment listener
            if (unsubscribeSegment) {
              unsubscribeSegment();
            }
            unsubscribeSegment = FirebaseFirestoreService.listenToDocument(
              "topical_segments",
              updatedShort.segment_id,
              (segmentDoc) => {
                if (segmentDoc) {
                  setSegment(documentToSegment(segmentDoc));
                }
              },
              (error) => {
                showNotification("Get Document", "Failed to get Segment", "error");
              }
            );
          }
        },
        (error) => {
          showNotification("Get Document", "Failed to get Short", "error");
        }
      );
    }

    setLoading(false);

    return () => {
      if (unsubscribeShort) unsubscribeShort();
      if (unsubscribeSegment) unsubscribeSegment();
    };
  }, [short_id, showNotification]);

  useEffect(() => {
    setSearchParams({ tab: activeTab, ...(short_id && { short_id }) });
  }, [activeTab, short_id, setSearchParams]);

  const [isOlderThanTwoMinutes, setIsOlderThanTwoMinutes] = useState(false);

  useEffect(() => {
    const checkTimestamp = () => {
      if (short?.last_updated) {
        const now = Timestamp.now();
        const diffInMinutes = (now.seconds - short.last_updated.seconds) / 60;
        setIsOlderThanTwoMinutes(diffInMinutes > 5);
      }
    };

    const interval = setInterval(checkTimestamp, 1000);
    return () => clearInterval(interval);
  }, [short]);

  const handleNextTab = () => {
    const currentIndex = tabConfig.findIndex((tab) => tab.value === activeTab);
    if (currentIndex < tabConfig.length - 1) {
      setActiveTab(tabConfig[currentIndex + 1].value);
    }
  };

  const handlePreviousTab = () => {
    const currentIndex = tabConfig.findIndex((tab) => tab.value === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabConfig[currentIndex - 1].value);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[80vh] flex justify-center items-center">
        <LoadingIcon id="shortEditor" text="Loading Short Information ..." className="my-16 mx-auto animate-pulse" />
      </div>
    );
  }

  return (
    <ScrollableLayout>
      <div className="m-auto my-2 text-white px-4 md:px-0">
        <CardHeader>
          <CardTitle>Short Video Creator</CardTitle>
          <CardDescription>Create and manage your short videos step by step</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="flex flex-col md:flex-row md:space-x-8">
            <TabsList className="flex-shrink-0 flex flex-col h-full space-y-2 w-64 mb-4 md:mb-0">
              {tabConfig.slice(0, -1).map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="w-full justify-start">
                  <span className="mr-2">{tab.icon}</span>
                  <span>{tab.title}</span>
                </TabsTrigger>
              ))}
              <div className="flex-1"></div> {/* This creates the spacer */}
              <TabsTrigger value="requests" className="w-full justify-start">
                <span className="mr-2">{tabConfig[tabConfig.length - 1].icon}</span>
                <span>{tabConfig[tabConfig.length - 1].title}</span>
              </TabsTrigger>
            </TabsList>
            <div className="flex-1 flex-grow">
              {tabConfig.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>{tab.title}</CardTitle>
                      <CardDescription>{tab.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {tab.value === "short-settings" && short_id && short && segment && (
                        <ShortSettingsTab short={short} shortId={short_id} />
                      )}
                      {tab.value === "transcript-editor" && short && short_id && segment && (
                        <TranscriptEditorTab shortId={short_id} short={short} segment={segment} />
                      )}
                      {tab.value === "attention-capture" && short && short_id && segment && (
                        <VideoTab shortId={short_id} short={short} segment={segment} />
                      )}
                      {tab.value === "export" && short && short_id && segment && (
                        <ExportTab shortId={short_id} short={short} />
                      )}
                      {tab.value === "performance" && short && short_id && segment && (
                        <PerformanceTab shortId={short_id} short={short} />
                      )}
                      {tab.value === "requests" && short && short_id && (
                        <RequestsTab shortId={short_id} short={short} />
                      )}
                    </CardContent>
                  </Card>
                  <div className="flex justify-between mt-4">
                    <Button onClick={handlePreviousTab} disabled={activeTab === "short-settings"}>
                      Previous
                    </Button>
                    <Button onClick={handleNextTab} disabled={activeTab === "requests"}>
                      Next
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </CardContent>
      </div>

      {
        short && short_id && short.auto_generate && (
          <ProcessingDialog shortId={short_id} short={short} isOpen={true} onClose={() => {}} />
        )
      }

      {short && short.pending_operation && (
        <Card className="mt-4 mx-auto fixed translate-x-[5vw] bottom-2 w-[90vw]">
          <CardHeader>
            <CardTitle>Operation in Progress</CardTitle>
            <CardDescription>{short.progress_message}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-secondary rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{ width: `${short.update_progress}%` }}
              ></div>
            </div>
            {short.last_updated && isOlderThanTwoMinutes && (
              <Button
                onClick={() => {
                  if (short_id) {
                    FirebaseFirestoreService.updateDocument(
                      "shorts",
                      short_id,
                      {
                        backend_status: "Completed",
                        pending_operation: false,
                      },
                      () => {
                        showNotification("Cancelled Operation", "Be careful of concurrency errors.", "success");
                      },
                      (err) => {
                        showNotification("Failed to Update", err.message, "error");
                      }
                    );
                  }
                }}
                className="mt-4"
                variant="destructive"
              >
                Cancel Operation
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </ScrollableLayout>
  );
};