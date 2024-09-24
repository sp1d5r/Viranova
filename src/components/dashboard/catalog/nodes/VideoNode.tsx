import React from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent } from '../../../ui/card';
import { VideoNodeData } from '../../../../types/Catalog';
import { Badge } from '../../../ui/badge';
import { Loader2 } from 'lucide-react';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Uploaded":
        return "!bg-blue-500 text-white";
      case "Link Provided":
        return "!bg-purple-500 text-white";
      case "Transcribing":
      case "Diarizing":
      case "Segmenting":
      case "Summarizing Segments":
        return "!bg-yellow-500 text-black";
      case "Clip Transcripts":
        return "!bg-green-500 text-white";
      case "Preprocessing Complete":
        return "!bg-indigo-500 text-white";
      case "Create TikTok Ideas":
        return "!bg-pink-500 text-white";
      default:
        return "!bg-gray-500 text-white";
    }
  };

  const isProcessing = [
    "Transcribing",
    "Diarizing",
    "Segmenting",
    "Summarizing Segments"
  ].includes(status);

  return (
    <Badge className={`flex items-center gap-1 ${getStatusColor(status)} text-xs`}>
      {isProcessing && <Loader2 className="h-3 w-3 animate-spin" />}
      {status}
    </Badge>
  );
};

const getThumbnailUrl = (video: VideoNodeData) => {
    let thumbnailUrl = 'https://via.placeholder.com/320x180.png?text=No+Thumbnail';
  
    if (video.thumbnailUrl) {
      thumbnailUrl = video.thumbnailUrl;
    }
  
    if (video.thumbnails) {
      const thumbnails = video.thumbnails;
  
      if (thumbnails.high?.url) {
        thumbnailUrl = thumbnails.high.url;
      } else if (thumbnails.standard?.url) {
        thumbnailUrl = thumbnails.standard.url;
      } else if (thumbnails.maxres?.url) {
        thumbnailUrl = thumbnails.maxres.url;
      } else if (thumbnails.medium?.url) {
        thumbnailUrl = thumbnails.medium.url;
      } else if (thumbnails.default?.url) {
        thumbnailUrl = thumbnails.default.url;
      }
    }
  
    return thumbnailUrl;
  };


interface VideoNodeProps {
    data: VideoNodeData;
    selected: boolean;
}

export const VideoNode: React.FC<VideoNodeProps> = ({ data, selected }) => (
  <Card className={`w-[250px] !border-sky-500 !p-2 shadow-md ${selected ? 'ring-2 ring-sky-500' : ''}`}>
    <Handle type="target" position={Position.Left} id={`${data.nodeId}-in`} />
    <Handle type="source" position={Position.Right} id={`${data.nodeId}-out`} />
    <div className="relative">
      <img
        src={getThumbnailUrl(data)}
        alt={data.videoTitle}
        className="w-full h-32 object-cover rounded-t-lg"
      />
      <div className="absolute top-2 right-2">
        <StatusBadge status={data.status} />
      </div>
    </div>
    <CardContent className="p-2">
      <a href={data.videoUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-sm mb-1 underline block truncate">
        {data.videoTitle}
      </a>
      <p className="text-xs text-muted-foreground mb-1">Duration: {data.duration}</p>
      <p className="text-xs text-muted-foreground">
        Uploaded: {new Date(data.uploadTimestamp).toLocaleDateString()}
      </p>
    </CardContent>
  </Card>
);