import React from 'react';
import { Card, CardContent } from "../../ui/card";
import { UserVideo } from "../../../types/collections/UserVideo";
import { Badge } from "../../ui/badge";
import { Loader2, Check } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

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

const getThumbnailUrl = (video: UserVideo) => {
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

interface SelectableVideoCardProps {
  video: UserVideo;
  isSelected: boolean;
  onToggle: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const SelectableVideoCard: React.FC<SelectableVideoCardProps> = ({ video, isSelected, onToggle }) => {
  return (
    <Card 
      className={`w-full cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-sky-500' : ''}`}
      onClick={onToggle}
    >
      <div className="relative">
        <img
          src={getThumbnailUrl(video)}
          alt={video.videoTitle}
          className="w-full h-32 object-cover rounded-t-lg"
        />
        <div className="absolute top-2 right-2">
          <StatusBadge status={video.status} />
        </div>
        {isSelected && (
          <div className="absolute bottom-2 right-2 bg-sky-500 rounded-full p-1">
            <Check className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
      <CardContent className="p-2">
        <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-sm mb-1 underline block truncate">
          {video.videoTitle || video.originalFileName}
        </a>
        <p className="text-xs text-muted-foreground mb-1">Duration: {video.duration}</p>
        <p className="text-xs text-muted-foreground">
          Uploaded: {new Date(video.uploadTimestamp instanceof Timestamp ? video.uploadTimestamp.toMillis() : video.uploadTimestamp).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
};