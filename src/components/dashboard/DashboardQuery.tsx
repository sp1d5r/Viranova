import React, { useState, useEffect, useMemo } from 'react';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import { useAuth } from "../../contexts/Authentication";
import FirebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import { Channel, ChannelsTracking } from '../../types/collections/Channels';
import { UserVideo } from "../../types/collections/UserVideo";
import { SelectableVideoCard } from './query/SelectableVideoCard';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { AudioLines, Bird, Captions, CornerDownLeft, Mic, Paperclip, Video } from 'lucide-react';
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Textarea } from '../ui/textarea';
import { Query } from '../../types/collections/Query';
import { QueryCard } from './query/QueryCard';
import { CreditButton } from '../ui/credit-button';
import { useQueryRequestManagement } from '../../contexts/QueryRequestProvider';

const DashboardQuery: React.FC = () => {
  const [queryText, setQueryText] = useState('');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [videos, setVideos] = useState<UserVideo[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [videoSearchTerm, setVideoSearchTerm] = useState('');
  const { authState } = useAuth();
  const [showVideos, setShowVideos] = useState(false);
  const [previousQueries, setPreviousQueries] = useState<Query[]>([]);
  const { createQueryRequest } = useQueryRequestManagement();

  useEffect(() => {
    if (authState.user?.uid) {
      fetchChannels(authState.user.uid);
      FirebaseFirestoreService.listenToQuery<Query>(
        'queries',
        'uid',
        authState.user.uid,
        'queryCreatedAt',
        (queryDocs) => {
          if (queryDocs) {
            console.log("Query docs:", queryDocs);
            setPreviousQueries(queryDocs);
          }
        },
        (error) => console.error("Error fetching previous queries:", error)
      );
    }
  }, [authState.user?.uid]);

  const fetchChannels = async (userId: string) => {
    try {
      const channelsTracking = await new Promise<ChannelsTracking | null>((resolve, reject) => {
        FirebaseFirestoreService.getDocument<ChannelsTracking>(
          'channelstracking',
          userId,
          (result) => resolve(result),
          reject
        );
      });
  
      if (channelsTracking && channelsTracking.channelsTracking) {
        const channelPromises = channelsTracking.channelsTracking.map(channelId =>
          new Promise<Channel>((resolve, reject) => {
            FirebaseFirestoreService.getDocument<Channel>(
              'channels',
              channelId,
              (channelData) => {
                if (channelData) {
                  resolve({ ...channelData, channelId });
                } else {
                  reject(new Error(`Channel ${channelId} not found`));
                }
              },
              reject
            );
          })
        );
        const fetchedChannels = await Promise.all(channelPromises);
        setChannels(fetchedChannels);
      } else {
        setChannels([]);
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
      setChannels([]);
    }
  };

  const addNewQuery = () => {
    FirebaseFirestoreService.addDocument(
      'queries',
      {
        queryText: queryText,
        queryModel: 'transcript',
        queryResults: 10,
        channelFilter: [selectedChannel],
        videoFilter: selectedVideos,
        queryCreatedAt: new Date(),
        status: 'requested',
        uid: authState.user?.uid
      },
      (query) => {
        console.log("Query added:", query);
        createQueryRequest(
            query,
            'v1/query-data-catalog',
            2, // creditCost
            (requestId: string) => console.log(`Query request created with ID: ${requestId}`),
            (error: Error) => console.error('Failed to create query request:', error)
          );
      },
      (error) => console.error("Error adding query:", error)
    );
  };

  const fetchVideosForChannel = async (channelId: string) => {
    try {
      const fetchedVideos = await new Promise<UserVideo[]>((resolve, reject) => {
        FirebaseFirestoreService.queryDocuments<UserVideo>(
          '/videos',
          'channelId',
          channelId,
          'uploadTimestamp',
          (documents) => resolve(documents),
          (error) => reject(error)
        );
      });
      setVideos(fetchedVideos);
    } catch (error) {
      console.error("Error fetching videos for channel:", error);
      setVideos([]);
    }
  };

  const handleChannelChange = (channelId: string) => {
    setSelectedChannel(channelId);
    setSelectedVideos([]);
    if (channelId) {
      fetchVideosForChannel(channelId);
    } else {
      setVideos([]);
    }
  };

  const handleVideoToggle = (e: React.MouseEvent, videoId: string) => {
    e.preventDefault();
    setSelectedVideos(prev =>
      prev.includes(videoId)
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const handleSubmitQuery = () => {
    if (queryText && authState.user?.uid) {
      addNewQuery();
      setQueryText('');
    }
  };

  const filteredVideos = useMemo(() => {
    return videos.filter(video => 
      video.videoTitle?.toLowerCase().includes(videoSearchTerm.toLowerCase()) ||
      video.originalFileName?.toLowerCase().includes(videoSearchTerm.toLowerCase())
    );
  }, [videos, videoSearchTerm]);

  return (
    <div className="w-full flex flex-col h-full">
        <div className="flex justify-between items-center w-full p-4 px-6 bg-secondary/50">
            <h1 className="text-2xl font-bold">Query Catalog</h1>
        </div>
        <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3 flex-1">
          <div
            className="relative hidden flex-col items-start gap-8 md:flex"
            x-chunk="A settings form a configuring an AI model and messages."
          >
            <form className="grid w-full items-start gap-6">
              <fieldset className="grid gap-6 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-sm font-medium">
                  Settings
                </legend>
                <div className="grid gap-3">
                  <Label htmlFor="model">Model</Label>
                  <Select>
                    <SelectTrigger
                      id="model"
                      className="items-start [&_[data-description]]:hidden"
                    >
                      <SelectValue placeholder="Search Modality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="explorer">
                        <div className="flex items-start gap-3 text-muted-foreground">
                          <Captions className="size-5" />
                          <div className="grid gap-0.5">
                            <p>
                              Vira{" "}
                              <span className="font-medium text-foreground">
                                Transcript
                              </span>
                            </p>
                            <p className="text-xs" data-description>
                              Search your preprocessed transcript data.
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="genesis">
                        <div className="flex items-start gap-3 text-muted-foreground">
                          <AudioLines className="size-5" />
                          <div className="grid gap-0.5">
                            <p>
                              Vira{" "}
                              <span className="font-medium text-foreground">
                                Emote
                              </span>
                            </p>
                            <p className="text-xs" data-description>
                              Search for sentiment and emotion in your data.
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="quantum" disabled>
                        <div className="flex items-start gap-3 text-muted-foreground">
                          <Video className="size-5" />
                          <div className="grid gap-0.5">
                            <p>
                              Vira{" "}
                              <span className="font-medium text-foreground">
                                Video
                              </span>
                            </p>
                            <p className="text-xs" data-description>
                              The most powerful model, querying visual data.
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Default Model: Vira Transcript</p>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="query-results">Query Results</Label>
                  <Input id="query-results" type="number" placeholder="5" />
                </div>
              </fieldset>
              <fieldset className="grid gap-6 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-sm font-medium">Filters</legend>
                <div className="flex gap-2">
                  <Button
                    variant='default'
                    onClick={() => setShowVideos(false)}
                  >
                    Channel
                  </Button>
                  <Button
                    type="button"
                    variant={showVideos ? 'default' : 'outline'}
                    onClick={() => setShowVideos(true)}
                    disabled={!selectedChannel}
                    
                  >
                    Video
                  </Button>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="channel-select">Channel</Label>
                  <Select value={selectedChannel} onValueChange={handleChannelChange}>
                    <SelectTrigger id="channel-select">
                      <SelectValue placeholder="Select a channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {channels.map((channel) => (
                        <SelectItem key={channel.channelId} value={channel.channelId!}>
                          <div className="flex items-center justify-start gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={channel.thumbnails?.default} />
                              <AvatarFallback>{channel.title?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start">
                              <p className="text-sm font-medium">{channel.title}</p>
                              <p className="text-xs text-muted-foreground">{channel.channelId}</p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {showVideos && selectedChannel && (
                  <div className="grid gap-3">
                    <Label htmlFor="video-search">
                        Search Videos {' '}
                        <span className="font-bold text-muted-foreground">{selectedVideos.length > 0 ? `(${selectedVideos.length})` : ''}</span>
                    </Label>
                    <Input
                      id="video-search"
                      placeholder="Search videos..."
                      value={videoSearchTerm}
                      onChange={(e) => setVideoSearchTerm(e.target.value)}
                    />
                    <ScrollArea className="h-[200px] border rounded-md p-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                        {filteredVideos.map((video) => (
                          <SelectableVideoCard
                            key={video.id}
                            video={video}
                            isSelected={selectedVideos.includes(video.id!)}
                            onToggle={(e) => handleVideoToggle(e, video.id!)}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </fieldset>
            </form>
          </div>
          <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
            <Badge variant="outline" className="absolute right-3 top-3">
              Previous Queries
            </Badge>
            {previousQueries.map((query) => (
              <QueryCard key={query.id} query={query} />
            ))}
            <div className="flex-1" />
            <form
              className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
              x-chunk="A form for sending a message to an AI chatbot. The form has a textarea and buttons to upload files and record audio."
            >
              <Label htmlFor="message" className="sr-only">
                Message
              </Label>
              <Textarea
                id="message"
                placeholder="Type your search query here..."
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
              />
              <div className="flex items-center p-3 pt-0">
                <Button variant="ghost" size="icon">
                  <Paperclip className="size-4" />
                  <span className="sr-only">Attach file</span>
                </Button>
                <Button variant="ghost" size="icon">
                    <Mic className="size-4" />
                    <span className="sr-only">Use Microphone</span>
                </Button>
                <CreditButton 
                    creditCost={2}
                    confirmationMessage='Search Catalog'
                    type="button" 
                    onClick={handleSubmitQuery} 
                    size="sm" 
                    className="ml-auto gap-1.5"
                >
                  Search Catalog
                  <CornerDownLeft className="size-3.5" />
                </CreditButton>
              </div>
            </form>
          </div>
        </main>
    </div>
  );
};

export default DashboardQuery;