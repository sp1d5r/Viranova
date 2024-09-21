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
import {CreditButton} from "../ui/credit-button";
import FirebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import { getVideoInfo } from "../../services/youtube";

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
  const [channelIdError, setChannelIdError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const { authState } = useAuth();
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [newVideoLink, setNewVideoLink] = useState('');

  const isValidChannelId = (channelId: string): boolean => {
    // YouTube channel IDs are typically 24 characters long
    // They start with UC and contain only alphanumeric characters and underscores
    const channelIdRegex = /^UC[\w-]{22}$/;
    return channelIdRegex.test(channelId);
  };

  const handleAddChannel = async () => {
    if (newChannelId) {
      if (isValidChannelId(newChannelId)) {
        setChannelIdError(null);
        await addChannelToTrack(newChannelId);
        setNewChannelId('');
        window.location.reload();
      } else {
        setChannelIdError('Invalid channel ID format. It should start with UC and be 24 characters long. Google it...');
      }
    }
  };

  const isValidYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return youtubeRegex.test(url);
  }

  const extractVideoId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
  };

  const handleAddVideo = async () => {
    if (newVideoLink) {
      if (isValidYouTubeUrl(newVideoLink)) {
        setIsAddingVideo(true);
        try {
          const videoId = extractVideoId(newVideoLink);
          const videoInfo = await getVideoInfo(videoId);
          
          if (videoInfo) {
            FirebaseFirestoreService.addDocument("videos", {
              ...videoInfo,
              uid: authState.user!.uid,
              processingProgress: 0,
              status: "Link Provided",
              previousStatus: "Started...",
              uploadTimestamp: Date.now(),
              progressMessage: "Performing Download",
              queuePosition: -1,
              link: newVideoLink,
            },
            (doc_id) => {
              showNotification(
                "Video Added!",
                `Successfully added new video: ${doc_id}`,
                "success",
                10000
              );
              setNewVideoLink('');
              setIsAddingVideo(false);
              window.location.href = `/video-handler?video_id=${doc_id}`
              // Assuming fetchVideos is defined elsewhere in your component
              // fetchVideos();  // Refresh the video list
            },
            (error) => {
              showNotification(
                "Error Adding Video",
                'Failed to add video. Please try again later.',
                "error",
                10000
              );
              console.error("Error adding video:", error);
            });
          } else {
            showNotification("Error", "Failed to fetch video information", "error");
          }
        } catch (error) {
          console.error("Error adding video:", error);
          showNotification("Error", "An error occurred while adding the video", "error");
        } finally {
          setIsAddingVideo(false);
        }
      } else {
        showNotification("Invalid Link", "Please provide a valid YouTube link.", "error");
      }
    } else {
      showNotification("No Link", "You need to add a YouTube link", "error");
    }
  };

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
      <div className="lg:hidden">
        <Tabs defaultValue="channels" className="w-full">
          <div className="w-full flex items-center justify-center p-2">
            <TabsList>
              <TabsTrigger value="channels" className="flex-1">Channels</TabsTrigger>
              <TabsTrigger value="details" className="flex-1">Channel Details</TabsTrigger>
              <TabsTrigger value="new-video" className="flex-1">New Video</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="channels">
            <ChannelsList
              channels={channels}
              setSelectedChannel={setSelectedChannel}
              selectedChannel={selectedChannel}
              newChannelId={newChannelId}
              setNewChannelId={setNewChannelId}
              handleAddChannel={handleAddChannel}
              isLoading={isLoading}
              error={error}
              channelIdError={channelIdError}
            />
          </TabsContent>
          <TabsContent value="details">
            {selectedChannel ? (
              <ChannelDetails
                channel={selectedChannel}
                userId={userId ? userId : "N/A"}
                channelId={selectedChannel.channelId!}
              />
            ) : (
              <div className="w-full h-full flex flex-col justify-center items-center p-4">
                <QuestionMarkCircledIcon className="w-10 h-10" />
                <p>No Channel Selected</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="new-video">
            <NewVideoForm
              newVideoLink={newVideoLink}
              setNewVideoLink={setNewVideoLink}
              handleAddVideo={handleAddVideo}
              isAddingVideo={isAddingVideo}
            />
          </TabsContent>
        </Tabs>
      </div>
      <div className="hidden lg:block">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>
            <ChannelsList
              channels={channels}
              setSelectedChannel={setSelectedChannel}
              selectedChannel={selectedChannel}
              newChannelId={newChannelId}
              setNewChannelId={setNewChannelId}
              handleAddChannel={handleAddChannel}
              isLoading={isLoading}
              error={error}
              channelIdError={channelIdError}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            {selectedChannel ? (
              <ChannelDetails
                channel={selectedChannel}
                userId={userId ? userId : "N/A"}
                channelId={selectedChannel.channelId!}
              />
            ) : (
              <div className="w-full h-full flex flex-col justify-center items-center">
                <QuestionMarkCircledIcon className="w-10 h-10" />
                <p>No Channel Selected</p>
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </main>
  );
}

interface ChannelsListProps {
  channels: Channel[];
  setSelectedChannel: React.Dispatch<React.SetStateAction<Channel | undefined>>;
  selectedChannel: Channel | undefined;
  newChannelId: string;
  setNewChannelId: React.Dispatch<React.SetStateAction<string>>;
  handleAddChannel: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  channelIdError: string | null;
}

const ChannelsList: React.FC<ChannelsListProps> = ({
                                                     channels,
                                                     setSelectedChannel,
                                                     selectedChannel,
                                                     newChannelId,
                                                     setNewChannelId,
                                                     handleAddChannel,
                                                     isLoading,
                                                     error,
                                                     channelIdError
                                                   }) => (
  <div className=" p-4 flex flex-col gap-2">
    <div className="flex flex-col items-center justify-between w-full">
      {error && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {channelIdError && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{channelIdError} <a className="underline text-primary" href="https://commentpicker.com/youtube-channel-id.php#google_vignette">Check here.</a></AlertDescription>
        </Alert>
      )}
      <h1 className="w-full text-lg font-semibold md:text-2xl my-2">Channels</h1>
      <div className="w-full flex gap-2" data-id="channel-id-adder">
        <Input
          className="h-9"
          type="text"
          placeholder="Add a channel ID to track"
          value={newChannelId}
          onChange={(e) => setNewChannelId(e.target.value)}
        />
        <CreditButton className="h-9" onClick={handleAddChannel} disabled={isLoading} creditCost={50} confirmationMessage="This action will cost 50 credits every month. Are you sure?">
          <GitPullRequestCreateArrow size={16}/>
        </CreditButton>
      </div>
      <ScrollArea className="h-[calc(100vh-200px)] my-2 w-full">
        {channels.map((channel, index) => (
          <ChannelCard
            key={index}
            selected={selectedChannel ? selectedChannel.channelId === channel.channelId : false}
            clickCard={() => { setSelectedChannel(channel) }}
            channel={channel}
          />
        ))}
      </ScrollArea>
    </div>
  </div>
);

interface NewVideoFormProps {
  newVideoLink: string;
  setNewVideoLink: React.Dispatch<React.SetStateAction<string>>;
  handleAddVideo: () => Promise<void>;
  isAddingVideo: boolean;
}

const NewVideoForm: React.FC<NewVideoFormProps> = ({ newVideoLink, setNewVideoLink, handleAddVideo, isAddingVideo }) => (
  <div className="w-full flex flex-col gap-2 p-4">
    <Input
      type="text"
      placeholder="Enter YouTube video link"
      value={newVideoLink}
      onChange={(e) => setNewVideoLink(e.target.value)}
    />
    <Button onClick={handleAddVideo} disabled={!newVideoLink || isAddingVideo}>
      {isAddingVideo ? "Adding Video..." : "Add New Video"}
    </Button>
  </div>
);