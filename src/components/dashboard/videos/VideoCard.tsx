import React, { useEffect } from "react";
import { UserVideo } from "../../../types/collections/UserVideo";
import { Badge } from "../../ui/badge";
import { Loader2, TrashIcon, ChevronDown, ChevronUp } from "lucide-react";
import { Progress } from "../../ui/progress";
import { Button } from "../../ui/button";
import { useNotification } from "../../../contexts/NotificationProvider";
import FirebaseFirestoreService from "../../../services/database/strategies/FirebaseFirestoreService";
import { VideoSegments } from "../../../pages/VideoSegments";
import { Timestamp } from "firebase/firestore";

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
        <Badge className={`flex items-center gap-1 ${getStatusColor(status)} `}>
        {isProcessing && <Loader2 className="h-3 w-3 animate-spin" />}
        {status}
        </Badge>
    );
};

interface VideoCardProps {
  video: UserVideo;
  isExpanded: boolean;
  onToggle: () => void;
  source: 'Channel' | 'Manual';
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, isExpanded, onToggle, source }) => {
  const { showNotification } = useNotification();

  useEffect(() => {
    if (isExpanded) {
      const videoSegmentsSection = document.getElementById(video.id!);
      if (videoSegmentsSection) {
        videoSegmentsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [isExpanded]);


  const handleDelete = () => {
    FirebaseFirestoreService.deleteDocument(
      "videos",
      video.id!,
      () => {
        showNotification("Successfully Deleted Video", video.id + " - Deleted successfully", "success");
        window.location.reload();
      }
    );
  };

  const getThumbnailUrl = (video: UserVideo) => {
    let thumbnailUrl = 'https://via.placeholder.com/320x180.png?text=No+Thumbnail';

    if (video.thumbnailUrl) {
      thumbnailUrl = video.thumbnailUrl;
    }

    if (video.thumbnails) {
      const thumbnails = video.thumbnails;

      if (thumbnails.high.url) {
        thumbnailUrl = thumbnails.high.url;
      } else if (thumbnails.standard?.url) {
        thumbnailUrl = thumbnails.standard?.url;
      } else if (thumbnails.maxres?.url) {
        thumbnailUrl = thumbnails.maxres?.url;
      } else if (thumbnails.medium.url) {
        thumbnailUrl = thumbnails.medium.url;
      } else if (thumbnails.default.url) {
        thumbnailUrl = thumbnails.default.url;
      }
    }

    return thumbnailUrl;
  };

  return (
    <div className={`bg-card rounded-lg shadow-md overflow-hidden ${isExpanded ? 'col-span-full' : ''}`}>
      <div className="relative">
        <img
          src={getThumbnailUrl(video)}
          alt={video.originalFileName}
          className="w-full h-40 object-cover"
        />
        <div className="absolute top-2 right-2">
          <StatusBadge status={video.status} />
        </div>
      </div>
      <div className="p-4">
        <a href={video.videoUrl} target="_blank" className="font-semibold  mb-2 underline">{video.videoTitle || video.originalFileName}</a>
        <div className="flex justify-between items-center">
          <a href={`https://www.youtube.com/channel/${video.channelId}`} target="_blank" className="text-sm font-bold mb-2 underline">
            {video.channelTitle}
          </a>
          <p className="text-sm text-muted-foreground mb-2">
            Uploaded: {new Date(video.uploadTimestamp instanceof Timestamp ? video.uploadTimestamp.toMillis() : video.uploadTimestamp).toLocaleDateString()}
          </p>
        </div>
        <Progress value={video.processingProgress} className="mb-2" />
        <p className="text-sm mb-2">{video.processingProgress.toFixed(2)}% complete</p>
        <div className="flex justify-between items-center">
          <Button size="sm" variant="outline" onClick={onToggle}>
            {isExpanded ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
            {isExpanded ? 'Less' : 'More'}
          </Button>
          <Button size="sm" variant="destructive" onClick={handleDelete}>
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {isExpanded && (
        <div id={video.id!} className="p-4 bg-gray-500/5 border-primary border-2 rounded-lg backdrop-blur-md my-2">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-2xl">Video Segments</h3>
              <VideoSegments videoId={video.id!} />
              <div>
                <h3 className="font-semibold mb-2">Details:</h3>
                <p>Source: {source}</p>
                <p>Link: {video.link || 'N/A'}</p>
                <p>Video Id: {video.id || 'N/A'}</p>
                <p>Backend Status: {video.backend_status}</p>
                <p>Progress Message: {video.progressMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};