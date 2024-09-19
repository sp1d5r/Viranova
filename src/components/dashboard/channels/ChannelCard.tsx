import React, {useEffect, useState} from 'react';
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { cn } from "../../../utils/cn";
import {Channel} from "../../../types/collections/Channels";

interface ChannelCardProps {
  channel: Channel;
  clickCard: () => void;
  selected: boolean;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
    channel,
    clickCard,
    selected
  }) => {

  return (
    <Card
      className={`mb-4 transition-colors cursor-pointer hover:bg-muted/50 ${selected ? "!bg-white border-white" : ''}`}
      onClick={clickCard}
    >
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-9 w-9">
          <AvatarImage src={channel.thumbnails ? channel.thumbnails.medium : "N/a"}
                       alt={channel.title ? channel.title : channel.channelId}/>
          <AvatarFallback>{channel.title ? channel.title.slice(0, 2).toUpperCase() : channel.channelId.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className={cn("text-lg font-semibold", selected && "text-black")}>
            {channel.title ? channel.title : channel.channelId}
          </h3>
          {channel.subscriberCount &&
            <p className="text-sm text-muted-foreground">{channel.subscriberCount} subscribers</p>}
        </div>
      </CardHeader>
      <CardContent>
        <p
          className="text-sm text-muted-foreground mb-2 line-clamp-2">{channel.description ? channel.description : "This channel is still being processed - wait for this information to update!"}</p>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="default" className="text-xs">
            {channel.status}
          </Badge>
          {channel.videoCount && <Badge variant="secondary" className="text-xs">
            {channel.videoCount} videos
          </Badge>}
          {channel.viewCount && <Badge variant="secondary" className="text-xs">
            {channel.viewCount} views
          </Badge>}
        </div>
      </CardContent>
    </Card>
  );
};