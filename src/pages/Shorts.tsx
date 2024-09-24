import React, {useCallback, useEffect, useState, useRef} from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {Card, CardContent, CardDescription, CardHeader, CardTitle, CollapsibleCard} from "../components/ui/card";
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
import {CheckCircle2, ChevronLeft, Circle, Loader2, Sparkles, TriangleAlert} from "lucide-react";
import {Label} from "../components/ui/label";
import {Popover, PopoverTrigger} from "../components/ui/popover";
import {PopoverContent} from "@radix-ui/react-popover";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "../components/ui/hover-card";
import {useShortRequestManagement} from "../contexts/ShortRequestProvider";
import {ShortRequest, ShortRequestEndpoints} from "../types/collections/Request";
import {CreditButton} from "../components/ui/credit-button";
import { debounce } from "lodash";
import { useBrowserNotification } from "../contexts/BrowserNotificationProvider";

export type TabType = "short-settings" | "transcript-editor" | "attention-capture" | "export" | "performance" | "requests";

type TabConfig = {
  value: TabType;
  title: string;
  description: string;
  icon: React.ReactNode
};
const tabConfig: TabConfig[] = [
  { value: "short-settings", title: "Short Settings", description: "Configure your short video settings", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { value: "transcript-editor", title: "Transcript Editor", description: "Edit and refine your video transcript", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
  { value: "attention-capture", title: "Attention Capture", description: "Enhance viewer engagement by editing visual components.", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> },
  { value: "export", title: "Export", description: "Prepare your short for publishing", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> },
  { value: "performance", title: "Performance", description: "Track your short's performance", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
  { value: "requests", title: "Requests", description: "Manage requests for this short", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
];

export interface ProcessingStage {
  id: string;
  label: string;
  creationEndpoint: ShortRequestEndpoints;
  endpoints: ShortRequestEndpoints[];
  requests: ShortRequest[];
  status: 'not-started' | 'in-progress' | 'completed' | 'outdated';
  lastUpdated: Timestamp | null;
  tabConfig: TabConfig;
}


export const Shorts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const short_id = searchParams.get("short_id");
  const [short, setShort] = useState<Short | undefined>();
  const [segment, setSegment] = useState<Segment | undefined>();
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const initialTab = (searchParams.get("tab") as TabType) || "short-settings";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const { createShortRequest, getShortRequests } = useShortRequestManagement();

  const [stages, setStages] = useState<ProcessingStage[]>([
    { id: 'edit_transcript', label: 'Edit Transcript', endpoints: ['v1/temporal-segmentation', 'v2/temporal-segmentation'], requests: [], status: 'not-started', lastUpdated: null, creationEndpoint: 'v1/temporal-segmentation', tabConfig: tabConfig[1] },
    { id: 'generate_audio', label: 'Generate Audio', endpoints: ['v1/manual-override-transcript', 'v1/generate-test-audio', 'v1/generate-intro'], requests: [], status: 'not-started', lastUpdated: null, creationEndpoint: 'v1/generate-test-audio', tabConfig: tabConfig[1] },
    { id: 'crop_clip', label: 'Cropping Clip', endpoints: ['v1/create-short-video'], requests: [], status: 'not-started', lastUpdated: null, creationEndpoint: 'v1/create-short-video', tabConfig: tabConfig[2] },
    { id: 'visual_interest', label: 'Getting Visual Interest', endpoints: ['v1/get_saliency_for_short'], requests: [], status: 'not-started', lastUpdated: null, creationEndpoint: 'v1/create-short-video', tabConfig: tabConfig[2] },
    { id: 'camera_cuts', label: 'Determining Camera Cuts', endpoints: ['v1/determine-boundaries'], requests: [], status: 'not-started', lastUpdated: null, creationEndpoint: 'v1/determine-boundaries', tabConfig: tabConfig[2] },
    { id: 'bounding_boxes', label: 'Find Bounding Boxes', endpoints: ['v1/get-bounding-boxes'], requests: [], status: 'not-started', lastUpdated: null, creationEndpoint: 'v1/get-bounding-boxes', tabConfig: tabConfig[2] },
    { id: 'generate_a_roll', label: 'Generate A-Roll', endpoints: ['v1/generate-a-roll'], requests: [], status: 'not-started', lastUpdated: null, creationEndpoint: 'v1/generate-a-roll', tabConfig: tabConfig[2] },
    { id: 'generate_final_clip', label: 'Generate Final Clip', endpoints: ['v1/create-cropped-video'], requests: [], status: 'not-started', lastUpdated: null, creationEndpoint: 'v1/create-cropped-video', tabConfig: tabConfig[3] },
  ]);

  const [requests, setRequests] = useState<ShortRequest[]>([]);
  const { notifyRequestCompleted } = useBrowserNotification();

  const isStageOutdated = useCallback((stageIndex: number) => {
    if (stageIndex === 0) return false;
    const currentStage = stages[stageIndex];
    const previousStage = stages[stageIndex - 1];
    return currentStage.lastUpdated && previousStage.lastUpdated && 
           currentStage.lastUpdated < previousStage.lastUpdated;
  }, [stages]);

  const updateStagesWithRequests = useCallback((fetchedRequests: ShortRequest[]) => {
    setStages(prevStages => {
      let lastCompletedTimestamp: Timestamp | null = null;
  
      return prevStages.map((stage, index) => {
        const stageRequests = fetchedRequests.filter(request => 
          stage.endpoints.includes(request.requestEndpoint)
        );
        
        let status: ProcessingStage['status'] = 'not-started';
        let lastUpdated: Timestamp | null = null;
  
        if (stageRequests.length > 0) {
          const latestRequest = stageRequests.reduce((latest, current) => {
            const latestTimestamp = latest.serverCompletedTimestamp || latest.serverStartedTimestamp || latest.requestCreated;
            const currentTimestamp = current.serverCompletedTimestamp || current.serverStartedTimestamp || current.requestCreated;
            return latestTimestamp && currentTimestamp && currentTimestamp > latestTimestamp ? current : latest;
          });
  
          if (latestRequest.serverCompletedTimestamp) {
            status = 'completed';
            lastUpdated = latestRequest.serverCompletedTimestamp;
          } else if (latestRequest.serverStartedTimestamp) {
            status = 'in-progress';
            lastUpdated = latestRequest.serverStartedTimestamp;
          } else if (latestRequest.requestCreated) {
            lastUpdated = latestRequest.requestCreated;
          }
        }
  
        // Check if the current stage is outdated
        if (lastCompletedTimestamp && lastUpdated && lastCompletedTimestamp > lastUpdated) {
          status = 'outdated';
        }
  
        // Update lastCompletedTimestamp if this stage is completed
        if (status === 'completed' && lastUpdated) {
          lastCompletedTimestamp = lastUpdated;
        }
  
        return { ...stage, requests: stageRequests, status, lastUpdated };
      });
    });
  }, []);

  useEffect(() => {
    const debouncedFetch = debounce(async () => {
      if (!short_id) return;
      try {
        const fetchedRequests = await new Promise<ShortRequest[]>((resolve, reject) =>
          getShortRequests(short_id, resolve, reject)
        );

        fetchedRequests.forEach(request => {
          const existingRequest = requests.find(r => r.id === request.id);
          if (request.serverCompletedTimestamp &&
            (!existingRequest || !existingRequest.serverCompletedTimestamp)) {
            notifyRequestCompleted(request);
          }
        });

        setRequests(fetchedRequests);
        updateStagesWithRequests(fetchedRequests);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
      }
    }, 300);

    debouncedFetch();

    return () => {
      debouncedFetch.cancel();
    };
  }, [short_id, getShortRequests, notifyRequestCompleted, updateStagesWithRequests]);


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
            console.log('updated_short', updatedShort.segment_id)

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
      <div className="m-auto my-2 text-white px-0 md:px-4">
        <CardHeader>
          <div className="flex gap-4 items-center justify-start">
            <Button
              onClick={() => {
                window.location.href = "/dashboard?tab=shorts"
              }}
              variant={"outline"}
            >
              <ChevronLeft />
            </Button>
            <div>
              <CardTitle>Short Video Creator</CardTitle>
              <CardDescription>Create and manage your short videos step by step</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="flex flex-col">
            <TabsList className="flex flex-wrap justify-evenly gap-2 mb-4">
              {tabConfig.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center flex-1">
                  <span className="mr-2">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/3">
                <CollapsibleCard defaultCollapsed={window.innerWidth >= 400}>
                  <CardHeader>
                    <CardTitle>Auto Generate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Edit each component and select auto-generate from that point onwards.</p>
                    {stages.filter((elem) => elem.status !== 'not-started').map((stage) => (
                      <div key={stage.id} className="flex items-center justify-between mb-2">
                        {stage.status === 'completed' && <CheckCircle2 className="text-green-500" />}
                        {stage.status === 'in-progress' && <Loader2 className="animate-spin text-gray-300" />}
                        {stage.status === 'not-started' && <Circle className="text-gray-300" />}
                        {stage.status === 'outdated' && <TriangleAlert className="text-yellow-300" />}
                        <span className={`flex-grow px-2 ${stage.status === 'completed' ? 'text-green-500' : stage.status === 'in-progress' ? 'text-gray-300' : 'text-gray-500'}`}>
                          {stage.label}
                        </span>
                        <Popover>
                          <PopoverTrigger>
                            <Button
                              size="icon"
                              variant="outline"
                            >
                              <Sparkles size={15} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 z-50">
                            <Card className="grid gap-4 p-4">
                              <div className="space-y-2">
                                <h4 className="font-medium leading-none">Confirm</h4>
                                <p className="text-sm text-muted-foreground">
                                  You're going to redo auto-generation from {stage.label}. {stage.tabConfig.description}.
                                </p>
                              </div>
                              <div className="grid gap-2">
                                <div className="grid grid-cols-2 items-center gap-4">
                                  <Label htmlFor="width">Confirm AutoGenerate</Label>
                                  <CreditButton
                                    creditCost={20}
                                    confirmationMessage={"You're auto-generating a video, we're expecting this to take 20 credits"}
                                    onClick={() => {
                                      if (short_id) {
                                        createShortRequest(
                                          short_id,
                                          stage.creationEndpoint,
                                          20,
                                          () => {
                                          },
                                          () => {
                                          },
                                          true
                                        )
                                      }
                                    }}
                                  >
                                    Generate
                                  </CreditButton>
                                </div>
                              </div>
                            </Card>
                          </PopoverContent>
                        </Popover>
                      </div>
                    ))}
                  </CardContent>
                </CollapsibleCard>
              </div>

              <div className="w-full md:w-2/3">
                {tabConfig.map((tab) => (
                  <TabsContent key={tab.value} value={tab.value} className="mt-0">
                    <Card className={"sm:p-0"}>
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
                  </TabsContent>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <Button onClick={handlePreviousTab} disabled={activeTab === "short-settings"}>
                Previous
              </Button>
              <Button onClick={handleNextTab} disabled={activeTab === "requests"}>
                Next
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </div>
      {
        short && short_id && short.auto_generate && (
          <ProcessingDialog 
            shortId={short_id} 
            short={short} 
            isOpen={true} 
            onClose={() => {}} 
            stages={stages}
            requests={requests}
        />
        )
      }

      {short && short.pending_operation && (
        <Card className="mt-4 mx-auto fixed translate-x-[5vw] bottom-2 w-[90vw]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <CardTitle>Operation in Progress</CardTitle>
                <CardDescription>{short.progress_message}</CardDescription>
              </div>
              <a href="/dashboard?tab=shorts">
                <Button>
                  Return
                </Button>
              </a>
            </div>
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
                        auto_generate: false
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