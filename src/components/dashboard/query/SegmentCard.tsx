import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { ArrowDown, ArrowUp, Scissors } from 'lucide-react';
import { documentToSegment, Segment } from '../../../types/collections/Segment';
import { getThumbnailUrl, UserVideo } from '../../../types/collections/UserVideo';
import { Skeleton } from '../../ui/skeleton';
import FirebaseFirestoreService from '../../../services/database/strategies/FirebaseFirestoreService';

interface SegmentCardProps {
  segment_id: string;
  video_id: string;
  distance: number;
  isSelected: boolean;
  onSelect: () => void;
}

export const SegmentCard: React.FC<SegmentCardProps> = ({ segment_id, video_id, distance, isSelected, onSelect }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [segment, setSegment] = React.useState<Segment | null>(null);
  const [video, setVideo] = React.useState<UserVideo | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);


  useEffect(() => {
    FirebaseFirestoreService.getDocument<UserVideo>("videos", video_id, (doc) => {
        if (doc) {
            setVideo(doc as UserVideo);
            FirebaseFirestoreService.getDocument("topical_segments", segment_id, (doc) => {
                if (doc) {
                    setSegment(documentToSegment(doc));
                    setIsLoading(false);
                }
            });
        }
    });
  }, [video_id, segment_id]);


  return (
    <Card 
      className={`w-[300px] mr-4 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onSelect}
    >
      <CardHeader className="p-2">
        <CardTitle className="text-sm flex justify-between items-center">
          {isLoading ? (
            <Skeleton className="h-4 w-3/4" />
          ) : (
            <p className="truncate">{video!.videoTitle}</p>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        {isLoading ? (
          <Skeleton className="w-full h-36 mb-2 rounded" />
        ) : (
          <img 
            src={getThumbnailUrl(video!)} 
            alt="Video thumbnail" 
            className="w-full h-36 object-cover mb-2 rounded"
          />
        )}
        <p className="text-xs text-muted-foreground mb-2">
          Segment ID: {isLoading ? <Skeleton className="h-3 w-1/2 inline-block ml-1" /> : segment_id}
        </p>
        <p className="text-xs text-muted-foreground mb-2">
          Distance: {isLoading ? <Skeleton className="h-3 w-1/4 inline-block ml-1" /> : distance.toFixed(4)}
        </p>
        {isExpanded && (
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              Segment Title: {isLoading ? <Skeleton className="h-3 w-3/4 inline-block ml-1" /> : (segment!.segmentTitle || 'N/A')}
            </p>
            <p className="text-xs text-gray-500">
              Segment Description: {isLoading ? <Skeleton className="h-3 w-full mt-1" /> : (segment!.segmentSummary || 'N/A')}
            </p>
            <div className="flex justify-between mt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  if (video) window.open(video.videoUrl, '_blank', 'noopener,noreferrer');
                }}
              >
                View Video
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  // Add logic to generate short
                }}
              >
                <Scissors size={14} className="mr-1" />
                Generate Short
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};