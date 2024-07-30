import React, {useState} from 'react';
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "../ui/resizable";
import {Input} from "../ui/input";
import {Button} from "../ui/button";
import {GitPullRequestCreateArrow} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "../ui/alert";
import {ExclamationTriangleIcon} from "@radix-ui/react-icons";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../ui/tabs";
import {ChannelCard} from './channels/ChannelCard'
import {ScrollArea} from "../ui/scroll-area";

export interface DashboardChannelsProps {

}

interface Channel {
  channelName: string;
  description: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
  thumbnailUrl:  string;
}

export const DashboardChannels: React.FC<DashboardChannelsProps> = ({}) => {
  const channels: Channel[] = [
    {
      channelName: "TechTalks",
      description: "Latest in technology and gadget reviews. We bring you cutting-edge insights and hands-on experiences with the newest tech products.",
      subscriberCount: "1.2M",
      videoCount: "500",
      viewCount: "50M",
      thumbnailUrl: "https://yt3.ggpht.com/ytc/APkrFKaHas_u9T4C9jtqYIpptEKE7P62n3vqsGfPj12htA=s176-c-k-c0x00ffffff-no-rj"
    },
    {
      channelName: "CookingMasters",
      description: "Delicious recipes and cooking tips for beginners and experts alike. Join us on a culinary journey around the world!",
      subscriberCount: "800K",
      videoCount: "300",
      viewCount: "30M",
      thumbnailUrl: "https://yt3.ggpht.com/ytc/APkrFKaLAFUu3Fs0-DjqnhYSyrdCNIWzz81HCFrXI993eQ=s176-c-k-c0x00ffffff-no-rj"
    },
    {
      channelName: "FitnessGuru",
      description: "Transform your body and mind with our expert fitness advice, workout routines, and health tips.",
      subscriberCount: "500K",
      videoCount: "200",
      viewCount: "15M",
      thumbnailUrl: "https://yt3.ggpht.com/ytc/APkrFKbWr2xknXmPNzNO7rAuWrtXSCkW9XxURFn-0VIB=s176-c-k-c0x00ffffff-no-rj"
    },
    {
      channelName: "TravelVlogs",
      description: "Explore the world through our eyes! We bring you breathtaking destinations, travel tips, and cultural experiences.",
      subscriberCount: "1.5M",
      videoCount: "400",
      viewCount: "75M",
      thumbnailUrl: "https://yt3.ggpht.com/ytc/APkrFKYBi_1MZOVr2JZ3hGxWRcD6o3AO_I9K5_2n6VAy=s176-c-k-c0x00ffffff-no-rj"
    }
  ];
  const [selectedChannel, setSelectedChannel] = useState<Channel | undefined>(undefined);

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
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              The channel url provided does not exist.
            </AlertDescription>
          </Alert>
          <div className="w-full flex gap-2">
            <Input  type="text" placeholder="Add a channel to track" />
            <Button  size="sm" onClick={() => {}} >
              <GitPullRequestCreateArrow />
            </Button>
          </div>
          <ScrollArea className="h-[80vh]">
            {channels.map((channel, index) => (
              <ChannelCard key={index} selected={selectedChannel ? selectedChannel.channelName == channel.channelName : false} clickCard={()=>{setSelectedChannel(channel)}} {...channel} />
            ))}
          </ScrollArea>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>Two</ResizablePanel>
    </ResizablePanelGroup>
  </main>
}