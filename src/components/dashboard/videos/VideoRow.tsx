import React, {useState, useEffect} from "react";
import FirebaseFirestoreService from "../../../services/database/strategies/FirebaseFirestoreService";
import {UserVideo} from "../../../types/collections/UserVideo";
import {TableRow, TableCell} from "../../ui/table";
import {Badge} from "../../ui/badge";
import {ChevronDown, ChevronUp, Loader2, TrashIcon} from "lucide-react";
import {Progress} from "../../ui/progress";
import {VideoSegments} from "../../../pages/VideoSegments";
import {Button} from "../../ui/button";
import {useNotification} from "../../../contexts/NotificationProvider";

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

export const VideoRow: React.FC<{ videoId: string; isExpanded: boolean; onToggle: () => void, source: 'Channel' | 'Manual' }> = ({ videoId, isExpanded, onToggle, source }) => {
  const [video, setVideo] = useState<UserVideo | null>(null);
  const {showNotification} = useNotification();

  useEffect(() => {
    const unsubscribe = FirebaseFirestoreService.listenToDocument<UserVideo>(
      'videos',
      videoId,
      (doc) => {
        if (doc) {
          setVideo(doc);
        } else {
          setVideo(null);
        }
      }
    );

    return () => unsubscribe();
  }, [videoId]);

  if (!video) return null;
  

  return (
    <React.Fragment>
      <TableRow className="cursor-pointer" onClick={onToggle}>
        <TableCell>{video.originalFileName}</TableCell>
        <TableCell>
          <a className="text-primary underline">{video.link}</a>
        </TableCell>
        <TableCell>
          <StatusBadge status={video.status} />
        </TableCell>
        <TableCell>{video.processingProgress && video.processingProgress.toFixed(2)}% <Progress value={video.processingProgress}/></TableCell>
        <TableCell>{new Date(video.uploadTimestamp).toLocaleDateString()}</TableCell>
        <TableCell className="flex gap-4 items-center">
          <Button size="icon" variant="outline" onClick={() => {
            FirebaseFirestoreService.deleteDocument(
              "videos",
              videoId,
              () => {
                showNotification("Successfully Deleted Video", videoId + " - Deleted successfully", "success");
                window.location.reload();
              }
            )
          }}>
            <TrashIcon className={"text-destructive"}/>
          </Button>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={6} className="bg-muted/50">
            <div className="p-4">

              <VideoSegments videoId={videoId}/>
              <h3 className="font-semibold mb-2">Additional Details:</h3>
              <p>Source: {source} </p>
              <p>Link: {video.link || 'N/A'}</p>
              <p>Video Id: {videoId || 'N/A'}</p>
              <p>Backend Status: {video.backend_status}</p>
              <p>Progress Message: {video.progressMessage}</p>
              <div className="flex gap-2">
                <Button size="icon" variant="destructive" onClick={() => {
                  FirebaseFirestoreService.deleteDocument(
                    "videos",
                    videoId,
                    () => {
                      showNotification("Successfully Deleted Video", videoId + " - Deleted successfully", "success");
                      window.location.reload();
                    }
                  )
                }}>
                  <TrashIcon />
                </Button>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
};