import React, { useState } from 'react';
import { X } from 'lucide-react';
import { VideoPlayer, VideoPlayerProps } from './VideoPlayer';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';

interface VideoPlayerModalProps extends VideoPlayerProps {
  trigger: React.ReactNode;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ trigger, ...videoPlayerProps }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] p-0">
        <div className="relative w-full h-full">
          <Button
            variant="ghost"
            className="absolute top-2 right-2 z-10"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="w-full h-full flex items-center justify-center">
            <VideoPlayer {...videoPlayerProps} className="w-full h-full" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;