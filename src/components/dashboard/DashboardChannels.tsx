import React, {useEffect, useState} from 'react';
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "../ui/resizable";
import {Input} from "../ui/input";
import {Button} from "../ui/button";
import {GitPullRequestCreateArrow} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "../ui/alert";
import {ExclamationTriangleIcon, QuestionMarkCircledIcon} from "@radix-ui/react-icons";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../ui/tabs";
import {ChannelCard} from './channels/ChannelCard'
import {ScrollArea} from "../ui/scroll-area";
import {Channel, ChannelsTracking, useAddChannelToTrack} from "../../types/collections/Channels";
import {useAuth} from "../../contexts/Authentication";
import FirebaseDatabaseService from "../../services/database/strategies/FirebaseFirestoreService";
import ChannelDetails from "./channels/DetailedChannelView";


export interface DashboardChannelsProps {
  userId?: string;
}

export const DashboardChannels: React.FC<DashboardChannelsProps> = ({userId}) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | undefined>(undefined);
  const [newChannelId, setNewChannelId] = useState('');
  const { addChannelToTrack, isLoading, error } = useAddChannelToTrack(userId? userId : "N/A");
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleAddChannel = async () => {
    if (newChannelId) {
      await addChannelToTrack(newChannelId);
      setNewChannelId('');
      // You might want to refresh the channels list here
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

  return <main className="flex flex-1 flex-col gap-4 md:gap-8 max-h-[calc(100vh-100px)]">
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel>
        <div className="p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold md:text-2xl">Channels</h1>
            <Tabs defaultValue="existing">
              <TabsList>
                <TabsTrigger value="existing">Existing</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {error && (
            <Alert variant="destructive">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
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
              <ChannelCard key={index} selected={selectedChannel ? selectedChannel.channelId == channel.channelId : false} clickCard={()=>{setSelectedChannel(channel)}} channel={channel} />
            ))}
          </ScrollArea>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        {
          selectedChannel ?
            <ChannelDetails channel={selectedChannel} />
            :
            <div className="w-full h-full flex flex-col justify-center items-center">
              <QuestionMarkCircledIcon className="w-10 h-10" />
              <p>No Channel Selected</p>
            </div>
        }
      </ResizablePanel>
    </ResizablePanelGroup>
  </main>
}