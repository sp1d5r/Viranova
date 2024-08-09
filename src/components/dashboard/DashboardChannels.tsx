import React, { useEffect, useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { GitPullRequestCreateArrow } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ExclamationTriangleIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ChannelCard } from './channels/ChannelCard'
import { ScrollArea } from "../ui/scroll-area";
import { Channel, ChannelsTracking, useAddChannelToTrack } from "../../types/collections/Channels";
import { useAuth } from "../../contexts/Authentication";
import FirebaseDatabaseService from "../../services/database/strategies/FirebaseFirestoreService";
import ChannelDetails from "./channels/DetailedChannelView";
import { useNotification } from "../../contexts/NotificationProvider";

export interface DashboardChannelsProps {
  userId?: string;
}

export const DashboardChannels: React.FC<DashboardChannelsProps> = ({ userId }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | undefined>(undefined);
  const [newChannelId, setNewChannelId] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const { addChannelToTrack, isLoading, error } = useAddChannelToTrack(userId ? userId : "N/A");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const { authState } = useAuth();


  const handleAddChannel = async () => {
    if (newChannelId) {
      await addChannelToTrack(newChannelId);
      setNewChannelId('');
      window.location.reload();
    }
  };

  const isValidYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
    return youtubeRegex.test(url);
  }

  const submitYoutubeLink = () => {
    if (youtubeLink) {
      if (isValidYouTubeUrl(youtubeLink)) {
        FirebaseDatabaseService.addDocument("videos", {
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
        showNotification("Invalid Link", "Please provide a valid YouTube link.", "error");
      }
    } else {
      showNotification("No Link", "You need to add a YouTube link", "error");
    }
  }

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const fetchChannels = async () => {
      try {
        if (userId){
          unsubscribe = FirebaseDatabaseService.listenToDocument<ChannelsTracking>(
            'channelstracking',
            userId,
            async (data) => {
              if (data && data.channelsTracking) {
                const channelPromises = data.channelsTracking.map(channelId =>
                  new Promise<Channel>((resolve, reject) => {
                    FirebaseDatabaseService.getDocument<Channel>(
                      'channels',
                      channelId,
                      (channelData) => {
                        if (channelData) {
                          resolve({ ...channelData, channelId });
                        } else {
                          reject(new Error(`Channel ${channelId} not found`));
                        }
                      },
                      (error) => reject(error)
                    );
                  })
                );
                const fetchedChannels = await Promise.all(channelPromises);
                console.log(fetchedChannels);
                setChannels(fetchedChannels);
              } else {
                setChannels([]);
              }
            },
            (error) => {
              console.error("Error fetching channels:", error);
              setFetchError("Failed to fetch channels. Please try again.");
            }
          );
        }
      } catch (error) {
        console.error("Error setting up channel listener:", error);
        setFetchError("Failed to set up channel updates. Please refresh the page.");
      }
    };

    fetchChannels();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId]);

  return (
    <main className="flex flex-1 flex-col gap-4 md:gap-8 max-h-[calc(100vh-100px)]">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <div className="p-4 flex flex-col gap-2">
            <div className="flex flex-col items-center justify-between w-full">
              {error && (
                <Alert variant="destructive">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <h1 className="w-full text-lg font-semibold md:text-2xl my-2">Channels</h1>
              <Tabs defaultValue="channels" className="w-full">
                <TabsList>
                  <TabsTrigger value="channels">Channels</TabsTrigger>
                  <TabsTrigger value="new-video">New Video</TabsTrigger>
                </TabsList>
                <TabsContent value="channels">
                  <div className="w-full flex gap-2">
                    <Input
                      className="h-9"
                      type="text"
                      placeholder="Add a channel ID to track"
                      value={newChannelId}
                      onChange={(e) => setNewChannelId(e.target.value)}
                    />
                    <Button className="h-9" onClick={handleAddChannel} disabled={isLoading}>
                      <GitPullRequestCreateArrow size={16}/>
                    </Button>
                  </div>
                  <ScrollArea className="h-[80vh]">
                    {channels.map((channel, index) => (
                      <ChannelCard
                        key={index}
                        selected={selectedChannel ? selectedChannel.channelId == channel.channelId : false}
                        clickCard={() => { setSelectedChannel(channel) }}
                        channel={channel}
                      />
                    ))}
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="new-video">
                  <div className="w-full flex flex-col gap-2">
                    <Input
                      type="text"
                      placeholder="Enter YouTube video link"
                      value={youtubeLink}
                      onChange={(e) => setYoutubeLink(e.target.value)}
                    />
                    <Button onClick={submitYoutubeLink} disabled={!youtubeLink}>
                      Add New Video
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          {selectedChannel ? (
            <ChannelDetails channel={selectedChannel} userId={userId ? userId : "N/A"} />
          ) : (
            <div className="w-full h-full flex flex-col justify-center items-center">
              <QuestionMarkCircledIcon className="w-10 h-10" />
              <p>No Channel Selected</p>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}