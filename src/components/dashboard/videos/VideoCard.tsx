import React, { useEffect } from "react";
import { getThumbnailUrl, UserVideo } from "../../../types/collections/UserVideo";
import { Badge } from "../../ui/badge";
import { Loader2, TrashIcon, ChevronDown, ChevronUp, RefreshCcw } from "lucide-react";
import { Progress } from "../../ui/progress";
import { Button } from "../../ui/button";
import { useNotification } from "../../../contexts/NotificationProvider";
import FirebaseFirestoreService from "../../../services/database/strategies/FirebaseFirestoreService";
import { VideoSegments } from "../../../pages/VideoSegments";
import { Timestamp } from "firebase/firestore";
import { VideoDetailsModal } from "./VideoDetailsModal";

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
  source: 'Channel' | 'Manual';
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, source }) => {
  const { showNotification } = useNotification();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

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

  return (
    <>
      <div className="bg-neutral-900/50 rounded-lg shadow-md overflow-hidden">
        <div className="relative">
          <img
            src={getThumbnailUrl(video)}
            alt={video.originalFileName}
            className="w-full h-40 object-cover cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          />
          <div className="absolute top-2 right-2">
            <StatusBadge status={video.status} />
          </div>
        </div>
        <div className="p-4">
          <a href={video.videoUrl} target="_blank" className="font-semibold mb-2 underline">
            {video.videoTitle || video.originalFileName}
          </a>
          <div className="flex justify-between items-center">
            <a href={`https://www.youtube.com/channel/${video.channelId}`} target="_blank" className="text-sm font-bold mb-2 underline">
              {video.channelTitle}
            </a>
            <p className="text-sm text-muted-foreground mb-2">
              Uploaded: {new Date(video.uploadTimestamp instanceof Timestamp ? video.uploadTimestamp.toMillis() : video.uploadTimestamp).toLocaleDateString()}
            </p>
          </div>
          <Progress value={video.processingProgress} className="mb-2" />
          <p className="text-sm mb-2">{!!video.processingProgress ? video.processingProgress.toFixed(2) : 0}% complete</p>
          <div className="flex justify-between items-center">
            <Button size="sm"  onClick={() => setIsModalOpen(true)}>
              View Details
            </Button>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => {
                FirebaseFirestoreService.updateDocument(
                  "videos",
                  video.id!,
                  {
                    previousStatus: 'Reloaded',
                    processingProgress: 0,
                  }
                )
              }}>
                <RefreshCcw className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={handleDelete}>
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <VideoDetailsModal
        video={video}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        source={source}
      />
    </>
  );
};