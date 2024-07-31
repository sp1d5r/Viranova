import React from 'react';
import { Channel } from '../../../types/collections/Channels';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { ScrollArea } from '../../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';

interface ChannelDetailsProps {
  channel: Channel;
}

const ChannelDetails: React.FC<ChannelDetailsProps> = ({ channel }) => {
  return (
    <ScrollArea className="h-[calc(100vh-100px)]">
      <Card className="m-4 relative overflow-hidden">
        <CardHeader>
          <div className="flex items-center space-x-4 z-10">
            <Avatar className="w-20 h-20">
              <AvatarImage src={channel.thumbnails?.default} alt={channel.title} />
              <AvatarFallback>{channel.title?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{channel.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{channel.customUrl}</p>
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
                <p>{channel.subscriberCount}</p>
              </div>
              <div>
                <h3 className="font-semibold">Total Views</h3>
                <p>{channel.viewCount}</p>
              </div>
              <div>
                <h3 className="font-semibold">Video Count</h3>
                <p>{channel.videoCount}</p>
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
          </div>
        </CardContent>
      </Card>
    </ScrollArea>
  );
};

export default ChannelDetails;