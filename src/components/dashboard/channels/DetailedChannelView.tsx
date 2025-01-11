import React, {useEffect, useState} from 'react';
import {Channel, useAddChannelToTrack} from '../../../types/collections/Channels';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { ScrollArea } from '../../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import {Video} from "../../../types/youtube/YoutubeVideo";
import {getRecentChannelVideos} from "../../../services/youtube";
import { formatDistanceToNow } from 'date-fns';
import {Button} from "../../ui/button";
import FirebaseFirestoreService from "../../../services/database/strategies/FirebaseFirestoreService";
import {useAuth} from "../../../contexts/Authentication";
import {useNotification} from "../../../contexts/NotificationProvider";
import {Loader2, MinusCircle, Trash, X, Bell} from "lucide-react";
import {ResubscribeTask} from "../../../types/collections/Task";
import {Timestamp} from "firebase/firestore";
import { motion } from 'framer-motion';

interface ChannelDetailsProps {
  channel: Channel;
  channelId: string;
  userId: string;
}

const ChannelDetails: React.FC<ChannelDetailsProps> = ({ channel, channelId, userId }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const {authState} = useAuth();
  const { showNotification } = useNotification();
  const { removeChannelFromTrack, isLoading, error } = useAddChannelToTrack(userId? userId : "N/A");
  const [resubTasks, setResubTasks] = useState<ResubscribeTask[]>([]);
  const [openResubTask, setOpenResubTask] = useState<boolean>(false);

  useEffect(() => {
    getResubTasks()
  }, [channelId]);

  const getResubTasks = () => {
    FirebaseFirestoreService.complexQuery<ResubscribeTask>(
      'tasks',
      [
        { field: 'operation', operator: '==', value: 'Re-Subscribe' },
        { field: 'channelId', operator: '==', value: channelId },
      ],
      [{ field: 'scheduledTime', direction: 'asc' }],
      (results) => {
        console.log(results);
        setResubTasks(results);
      },
      (error) => {
        console.error('Query error:', error);
      }
    );
  }

  useEffect(() => {
    getRecentChannelVideos(channel.channelId, 50).then((vids) => {
      setVideos(vids);
    });
  }, [channel]);

  const submitYoutubeLink = (videoId: string) => {
    const youtubeLink = `https://www.youtube.com/watch?v=${videoId}`;
    if (youtubeLink) {
      FirebaseFirestoreService.addDocument("videos", {
          uid: authState.user!.uid,
          processingProgress: 0,
          status: "Link Provided",
          previousStatus: "Started...",
          uploadTimestamp: Date.now(),
          progressMessage: "Performing Download",
          queuePosition: -1,
          link: youtubeLink,
        },
        (doc_id) => {
          showNotification(
            "Created Document!",
            `Successfully created new document: ${doc_id}`,
            "success",
            10000
          );
          window.location.href = `/video-handler?video_id=${doc_id}`
        },
        () => {
          showNotification(
            "Error Document Creation",
            'Failed to create document... Try again another time maybe?',
            "error",
            10000
          );
        }
      )
      } else {
        showNotification("Invalid Link", "Come on... Give me a real link...", "error");
      }
  }

  const submitButton = (videoId: string) => {
    if (authState.isAuthenticated && authState.user && authState.user.uid) {
      submitYoutubeLink(videoId);
    } else {
      window.location.href = "/authenticate";
    }
  }

  const handleRemoveChannel = async () => {
    try {
      await removeChannelFromTrack(channel.channelId);
      showNotification("Channel Removed", "Successfully removed the channel from tracking", "success");
      window.location.reload();
    } catch (err) {
      showNotification("Error", "Failed to remove the channel. Please try again.", "error");
    }
  };

  function numberWithCommas(x: string| undefined) {
    if (x) return x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    else return "Unknown..."
  }

  const createRescheduleAnalyticsTask = () => {
    var scheduledTime = new Date();
    scheduledTime.setMinutes(scheduledTime.getMinutes()+2);
    const newTask = {
      operation: 'Re-Subscribe',
      channelId: channelId,
      status: 'Pending',
      createdAt: Timestamp.fromDate(new Date()),
      scheduledTime: Timestamp.fromDate(scheduledTime), // Schedule for 1 minute from now, adjust as needed
      userId: userId
    };

    FirebaseFirestoreService.addDocument(
      'tasks',
      newTask,
      (taskId) => {
        showNotification(
          "Channel Resubscribed",
          `Successfully created a new task to resub to channel ${channel.title}`,
          "success",
          5000
        );
        getResubTasks(); // Refresh the task list
      },
      (error) => {
        showNotification(
          "Error",
          "Failed to create task for rescheduling analytics. Please try again.",
          "error",
          5000
        );
        console.error("Error creating task:", error);
      }
    );
  };


  return (
    <ScrollArea className="h-[calc(100vh-100px)] gap-2">
      <Card className="m-4 relative overflow-hidden">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center space-x-4 z-10 gap-2">
            <Avatar className="w-20 h-20">
              <AvatarImage src={channel.thumbnails?.default} alt={channel.title} />
              <AvatarFallback>{channel.title?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{channel.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{channel.customUrl}</p>
            </div>
            <div className="flex-1"/>
            <div className="flex  flex-wrap flex-row md:flex-col items-end justify-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  createRescheduleAnalyticsTask()
                }}
              >
                Resubscribe to Channel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveChannel}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Remove
              </Button>
              <a href={"/something"}>
                <Button>
                  View Channel
                </Button>
              </a>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 z-10">
            <div>
              <h3 className="font-semibold">Description</h3>
              <p className="text-sm">{channel.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Subscribers</h3>
                <p>{numberWithCommas(channel.subscriberCount)}</p>
              </div>
              <div>
                <h3 className="font-semibold">Total Views</h3>
                <p>{numberWithCommas(channel.viewCount)}</p>
              </div>
              <div>
                <h3 className="font-semibold">Video Count</h3>
                <p>{numberWithCommas(channel.videoCount)}</p>
              </div>
              <div>
                <h3 className="font-semibold">Country</h3>
                <p>{channel.country}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Privacy Status</h3>
              <p>{channel.privacyStatus}</p>
            </div>
            <div>
              <h3 className="font-semibold">Published At</h3>
              <p>{new Date(channel.publishedAt || '').toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-semibold">Topic Categories</h3>
              <ul className="list-disc list-inside">
                {channel.topicCategories?.map((topic, index) => (
                  <li key={index}>{topic.split('/').pop()}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Status</h3>
              <p>{channel.status}</p>
            </div>
            <div>
              <h3 className="font-semibold">Channel ID</h3>
              <p>{channel.channelId}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="m-4 bg-[#f8f9fc] dark:bg-[#1c1c1c] border-none rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Refresh Connection</CardTitle>
            <CardDescription>To automatically download videos from this channel.</CardDescription>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={createRescheduleAnalyticsTask}
            className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black rounded-xl"
          >
            Refresh Connection
          </Button>
        </CardHeader>
        <CardContent>
          {resubTasks.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Next refresh in: {formatDistanceToNow(resubTasks[resubTasks.length - 1].scheduledTime.toDate())}
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-black dark:bg-white"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ 
                      duration: (resubTasks[0].scheduledTime.toDate().getTime() - Date.now()) / 1000,
                      ease: "linear"
                    }}
                  />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    FirebaseFirestoreService.deleteDocument(
                      'tasks',
                      resubTasks[0].id!,
                      () => {
                        showNotification("Cancelled Refresh", "Successfully cancelled the analytics refresh", "success")
                        getResubTasks();
                      }
                    )
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {resubTasks.length > 1 && (
                <div onClick={() => setOpenResubTask(!openResubTask)} className="text-sm text-muted-foreground hover:underline cursor-pointer">
                  +{resubTasks.length - 1} more refresh{resubTasks.length - 1 > 1 ? 'es' : ''} scheduled
                </div>
              )}

              {openResubTask && <div className="flex flex-col items-center justify-center">
                {resubTasks.map((task, index) => (
                  <motion.div whileInView={{ opacity: 1 }} className="w-full">
                    <div className="flex items-center justify-center gap-2 w-full hover:bg-muted/50 rounded-xl p-2">
                      <div className="flex flex-col items-start justify-center flex-1">
                        <p>{task.scheduledTime.toDate().toLocaleString()}</p>
                        <p>{task.status}</p>
                      </div>

                      <Button className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black rounded-xl" size="icon" variant="ghost" onClick={() => {
                        FirebaseFirestoreService.deleteDocument(
                          'tasks',
                          task.id!,
                          () => {
                            showNotification("Cancelled Refresh", "Successfully cancelled the analytics refresh", "success")
                            getResubTasks();
                          }
                        )
                      }}>
                        <MinusCircle />
                      </Button>
                    </div>
                  </motion.div>
                ))
                }
              </div>}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 opacity-50" />
              <p>No analytics refreshes scheduled</p>
              <p className="text-sm">Click the button above to schedule a refresh</p>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="m-4">
        <h2 className="text-2xl font-bold mb-4">Recent Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <Card key={video.videoId} className="overflow-hidden">
              <img src={video.thumbnailUrl} alt={video.videoTitle} className="w-full h-48 object-cover" />
              <CardContent className="p-4">
                <a href={`https://www.youtube.com/watch?v=${video.videoId}`} className="font-semibold text-lg mb-2 line-clamp-2 hover:underline">{video.videoTitle}</a>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{video.videoDescription}</p>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatDistanceToNow(new Date(video.publishedAt))} ago</span>
                  <span>{video.viewCount.toLocaleString()} views</span>
                </div>
                <Button cooldown={100} size="sm" onClick={()=>{submitButton(video.videoId)}} className="mt-2">
                  Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

export default ChannelDetails;