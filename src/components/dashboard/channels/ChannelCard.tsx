import React from 'react';
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { cn } from "../../../utils/cn"; // Make sure you have this utility function

interface ChannelCardProps {
  channelName: string;
  description: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
  thumbnailUrl: string;
  clickCard: () => void;
  selected: boolean;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
                                                          channelName,
                                                          description,
                                                          subscriberCount,
                                                          videoCount,
                                                          viewCount,
                                                          thumbnailUrl,
                                                          clickCard,
                                                          selected
                                                        }) => (
  <Card
    className={`mb-4 transition-colors cursor-pointer hover:bg-muted/50 ${selected ? "!bg-white border-white" : ''}`}
    onClick={clickCard}
  >
    <CardHeader className="flex flex-row items-center gap-4 pb-2">
      <Avatar className="h-9 w-9">
        <AvatarImage src={thumbnailUrl} alt={channelName} />
        <AvatarFallback>{channelName.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div>
        <h3 className={cn("text-lg font-semibold", selected && "text-black")}>
          {channelName}
        </h3>
        <p className="text-sm text-muted-foreground">{subscriberCount} subscribers</p>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{description}</p>
      <div className="flex gap-2 flex-wrap">
        <Badge variant="secondary" className="text-xs">
          {videoCount} videos
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {viewCount} views
        </Badge>
      </div>
    </CardContent>
  </Card>
);