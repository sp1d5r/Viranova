import React, { useState, useEffect } from "react";
import { Short } from "../../types/collections/Shorts";
import FirebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import { useNotification } from "../../contexts/NotificationProvider";
import { VideoPlayer } from "../video-player/VideoPlayer";
import { LoadingIcon } from "../loading/Loading";
import { FirebaseStorageService } from "../../services/storage/strategies";
import { Timestamp } from "firebase/firestore";
import { AnalyticsTask } from "../../types/collections/Task";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { ReloadIcon } from "@radix-ui/react-icons";
import {useShortRequestManagement} from "../../contexts/ShortRequestProvider";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "../ui/alert-dialog";
import {CreditButton} from "../ui/credit-button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export interface ExportTabProps {
  short: Short;
  shortId: string;
}

type DataCollectionType = 'Static' | 'Dynamic Decay' | 'Data Freak';

interface DataCollectionOption {
  type: DataCollectionType;
  description: string;
  schedule: () => number[];
}

const dataCollectionOptions: DataCollectionOption[] = [
  {
    type: 'Static',
    description: '10 Data pulls across 3 days: 5 times in the first 6 hours, 3 times in the next 12, then once a day for the next two days',
    schedule: () => {
      const now = Date.now();
      const hour = 3600000;
      return [
        ...Array(5).fill(0).map((_, i) => now + i * hour),
        ...Array(3).fill(0).map((_, i) => now + 6 * hour + i * 4 * hour),
        now + 24 * hour,
        now + 48 * hour
      ];
    }
  },
  {
    type: 'Dynamic Decay',
    description: '30 data pulls across 5 days: every 15 mins in the first 2 Hours (8 pulls), every 30 mins in the next 6 hours (12 pulls), then 10 more pulls over the next 4 days',
    schedule: () => {
      const now = Date.now();
      const minute = 60000;
      return [
        ...Array(8).fill(0).map((_, i) => now + i * 15 * minute),
        ...Array(12).fill(0).map((_, i) => now + 2 * 60 * minute + i * 30 * minute),
        ...Array(10).fill(0).map((_, i) => now + 8 * 60 * minute + i * 12 * 60 * minute)
      ];
    }
  },
  {
    type: 'Data Freak',
    description: '50 data pulls across 7 days: every 10 mins in the first 3 hours, every 30 mins for the next 9 hours, hourly for the next 36 hours, then 6 times a day for the remaining days',
    schedule: () => {
      const now = Date.now();
      const minute = 60000;
      const hour = 3600000;
      return [
        ...Array(18).fill(0).map((_, i) => now + i * 10 * minute),
        ...Array(18).fill(0).map((_, i) => now + 3 * hour + i * 30 * minute),
        ...Array(36).fill(0).map((_, i) => now + 12 * hour + i * hour),
        ...Array(24).fill(0).map((_, i) => now + 48 * hour + i * 4 * hour)
      ];
    }
  }
];

export const ExportTab: React.FC<ExportTabProps> = ({ short, shortId }) => {
  const [tikTokLink, setTikTokLink] = useState(short.tiktok_link || '');
  const [selectedDataCollection, setSelectedDataCollection] = useState<DataCollectionType>('Static');
  const { showNotification } = useNotification();
  const [isPreviewRequested, setIsPreviewRequested] = useState(false);
  const [isTikTokLinkSubmitted, setIsTikTokLinkSubmitted] = useState(false);
  const { createShortRequest } = useShortRequestManagement();
  const [isRescheduling, setIsRescheduling] = useState(false);

  const updateTikTokLink = async () => {
    try {
      await FirebaseFirestoreService.updateDocument(
        "shorts",
        shortId,
        {
          "tiktok_link": tikTokLink,
        }
      );
      showNotification("Success", "TikTok link updated", "success");
      setIsTikTokLinkSubmitted(true);
    } catch (error) {
      showNotification("Failed", "Error updating TikTok link", "error");
    }
  };

  const deleteFutureScheduledTasks = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      FirebaseFirestoreService.queryDocuments<AnalyticsTask>(
        'tasks',
        'shortId',
        shortId,
        'scheduledTime',
        (tasks) => {
          const futureTasks = tasks.filter(task => task.status === 'Pending');

          Promise.all(futureTasks.map(task =>
            new Promise<void>((resolveDelete) => {
              FirebaseFirestoreService.deleteDocument(
                'tasks',
                task.id!,
                () => resolveDelete(),
                (error) => {
                  console.error("Error deleting task:", error);
                  resolveDelete();
                }
              );
            })
          )).then(() => {
            console.log(`Deleted ${futureTasks.length} future scheduled tasks`);
            resolve();
          });
        },
        (error) => {
          console.error("Error querying tasks:", error);
          reject(error);
        }
      );
    });
  };

  const scheduleAnalyticsTasks = () => {
    const selectedOption = dataCollectionOptions.find(option => option.type === selectedDataCollection);
    if (!selectedOption) {
      showNotification("Data Collection Option", "Add a data collection option first", "error");
      return;
    }

    const scheduleTask = () => {
      const taskSchedule = selectedOption.schedule();
      const tasks: AnalyticsTask[] = taskSchedule.map((scheduledTime) => ({
        status: 'Pending',
        scheduledTime: Timestamp.fromMillis(scheduledTime),
        operation: 'Analytics',
        taskResultId: `${shortId}_${scheduledTime}`,
        shortId: shortId,
        tikTokLink: tikTokLink
      }));

      let tasksAdded = 0;
      tasks.forEach(task => {
        FirebaseFirestoreService.addDocument(
          'tasks',
          task,
          () => {
            tasksAdded++;
            if (tasksAdded === tasks.length) {
              showNotification("Success", `Scheduled ${tasks.length} analytics tasks`, "success");
              setIsRescheduling(false);
            }
          },
          (error) => {
            console.error("Error adding task:", error);
            showNotification("Failed", "Error scheduling some analytics tasks", "error");
          }
        );
      });
    };

    FirebaseFirestoreService.updateDocument(
      'shorts',
      shortId,
      {
        'tasks_requested': true
      },
      () => {
        console.log("Tasks requested updated");
      },
      () => {
        console.log("Error updating tasks requested");
      }
    );

    if (isRescheduling) {
      deleteFutureScheduledTasks()
        .then(scheduleTask)
        .catch(error => {
          console.error("Error in scheduleAnalyticsTasks:", error);
          showNotification("Failed", "Error scheduling analytics tasks", "error");
        });
    } else {
      scheduleTask();
    }
  };


  const handlePreviewRequest = () => {
    createShortRequest(
      shortId,
      "v1/create-cropped-video",
      2,
      (requestId) => {
        showNotification("Preview Video", `Request ID: ${requestId}`, "success");
      },
      (error) => {
        showNotification("Preview Video Failed", `${error}`, "error");
      }
    );
  };

  const handleDownload = () => {
    FirebaseStorageService.downloadFile(short.finished_short_location).then(
      (blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', short.finished_short_location.split("/").filter((_, index) => index > 0).join(''));
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
      }
    ).catch(
      (err) => {showNotification('Error', 'Failed to get URL - preview first', 'error')}
    );
  };

  return (
    <div className="w-full">
      <CardContent className="space-y-6">
        {!isPreviewRequested && (
          <div className="flex flex-col space-y-2 w-full">
            <Label htmlFor="preview">Preview your short before posting</Label>
            <div className="w-full flex gap-2">
              <Button disabled={!!short.finished_short_location} id="preview" onClick={handlePreviewRequest} className="flex-1">
                Preview Short
              </Button>
              {!!short.finished_short_location && <CreditButton creditCost={2} confirmationMessage={"This costs 2 credits are you sure?"} size={"icon"} variant="outline" onClick={handlePreviewRequest}>
                <ReloadIcon/>
              </CreditButton>}
            </div>
          </div>
        )}

        {short.finished_short_location && (
          <>
            <div className="space-y-2">
              <Label>Preview</Label>
              <VideoPlayer path={short.finished_short_location} loadingText={"Loading Finished Product"}/>
            </div>

            <Button>
              Upload to TikTok
            </Button>

            <div className="space-y-2">
              <Label htmlFor="tiktok-link">Enter TikTok link after posting</Label>
              <div className="flex gap-2">
                <Input
                  id="tiktok-link"
                  value={tikTokLink}
                  onChange={(e) => setTikTokLink(e.target.value)}
                  placeholder="https://www.tiktok.com/@username/video/..."
                  disabled={isTikTokLinkSubmitted}
                />
                <Button onClick={updateTikTokLink} disabled={!tikTokLink || isTikTokLinkSubmitted}>
                  Submit
                </Button>
              </div>
            </div>

            {isTikTokLinkSubmitted && !short.tasks_requested && (
              <div className="space-y-2">
                <Label>Select data collection type</Label>
                <RadioGroup value={selectedDataCollection} onValueChange={(value) => setSelectedDataCollection(value as DataCollectionType)}>
                  {dataCollectionOptions.map((option) => (
                    <div key={option.type} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.type} id={option.type} />
                      <Label htmlFor={option.type}>{option.type}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <p className="text-sm text-muted-foreground">{dataCollectionOptions.find(o => o.type === selectedDataCollection)?.description}</p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button>Schedule Analytics</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Confirm Analytics Scheduling</AlertDialogTitle>
                      <AlertDialogDescription>
                        {isRescheduling
                          ? "This will delete all pending tasks and create new ones. Are you sure you want to reschedule?"
                          : "Are you sure you want to schedule analytics tasks? If you've already scheduled tasks, consider updating the TikTok link instead of rescheduling."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="text-white">Cancel</AlertDialogCancel>
                      <AlertDialogAction>
                        <CreditButton
                          creditCost={2}
                          onClick={() => {
                          setIsRescheduling(true);
                          scheduleAnalyticsTasks();
                        }}>
                          Confirm
                        </CreditButton>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </>
        )}
        {
              short.tasks_requested && (
                <Alert className="flex flex-row justify-between gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      FirebaseFirestoreService.updateDocument(
                        'shorts',
                        shortId,
                        {
                          'tasks_requested': false,
                          'tiktok_link': ''
                        }
                      );
                    }}
                  >
                    <ReloadIcon />
                  </Button>
                  <div className="flex flex-col flex-1">
                    <AlertTitle>Tasks Requested</AlertTitle>
                    <AlertDescription>
                      Tasks have been requested for this short. If you want to update the TikTok link, you can do so by pressing refresh.
                    </AlertDescription>
                  </div>
                </Alert>
              )
            }
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleDownload} disabled={!short.finished_short_location}>
          Download Short
        </Button>
      </CardFooter>
    </div>
  );
};