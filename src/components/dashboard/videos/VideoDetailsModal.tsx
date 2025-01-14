import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { UserVideo } from "../../../types/collections/UserVideo";
import { VideoSegments } from "../../../pages/VideoSegments";

interface VideoDetailsModalProps {
  video: UserVideo;
  isOpen: boolean;
  onClose: () => void;
  source: 'Channel' | 'Manual';
}

export const VideoDetailsModal: React.FC<VideoDetailsModalProps> = ({
  video,
  isOpen,
  onClose,
  source,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] w-full max-h-[90vh] overflow-y-auto text-white !bg-background ">
        <DialogHeader>
          <DialogTitle>{video.videoTitle || video.originalFileName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="font-semibold mb-2 text-2xl">Video Segments</h3>
            <VideoSegments videoId={video.id!} />
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Details:</h3>
              <p>Source: {source}</p>
              <p>Link: {video.link || 'N/A'}</p>
              <p>Video Id: {video.id || 'N/A'}</p>
              <p>Backend Status: {video.backend_status}</p>
              <p>Progress Message: {video.progressMessage}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};