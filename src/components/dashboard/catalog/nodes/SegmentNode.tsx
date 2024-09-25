import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { SegmentNodeData } from '../../../../types/Catalog';
import { Button } from '../../../ui/button';
import { ArrowDown, ArrowUp, RefreshCw, Scissors } from 'lucide-react';
import { useShortRequestManagement } from '../../../../contexts/ShortRequestProvider';
import { useNotification } from '../../../../contexts/NotificationProvider';
import FirebaseDatabaseService from '../../../../services/database/strategies/FirebaseFirestoreService';
import { useAuth } from '../../../../contexts/Authentication';

export const SegmentNode: React.FC<{ data: SegmentNodeData; id: string }> = ({ data, id }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { createShortRequest } = useShortRequestManagement();
  const { showNotification } = useNotification();
  const { authState } = useAuth();

  const handleGenerateShort = () => {
    FirebaseDatabaseService.addDocument(
        "shorts",
        {
          "segment_id": data.id,
          "logs": [],
          "transcript": data.transcript,
          "short_idea": data.shortIdea,
          "short_idea_explanation": data.shortIdeaExplanation,
          "short_idea_run_id": data.shortRunId,
          "video_id": data.videoId,
          "start_index": data.startIndex,
          "end_index": data.endIndex,
          "error_count": 5,
          "previous_short_status": "Request AI Extraction",
          "short_status": "Edit Transcript",
          "pending_operation": false,
          "uid": authState.user?.uid,
          "auto_generate": true,
          "selected_box_type": 'standard_tiktok',
          "background_video_path": 'background-gameplay/Clip1.mp4'
        },
        (shortId) => {
          FirebaseDatabaseService.updateDocument(
            "topical_segments",
            data.id,
            {
              segment_status: 'Crop Segment'
            },
            () => {
              showNotification("Short Generation", "Short generation started", "success");
              createShortRequest(
                shortId,
                "v1/temporal-segmentation",
                20,
                (requestId) => {
                  showNotification("Short Request Created", `Request ID: ${requestId}`, "success");
                  window.open(`/shorts?short_id=${shortId}`, '_blank', 'noopener,noreferrer');
                },
                (error) => {
                  showNotification("Short Request Creation Failed", `${error}`, "error");
                }
              );
            },
            (error) => {
              showNotification("Cropping Segment", `${error}`, "error");
            }
          );
        },
        (error) => {
          showNotification("Document Creation", `${error}`, "error");
        }
      );
  };

  const handleRegenerateShortIdea = () => {
    FirebaseDatabaseService.updateDocument(
      "topical_segments",
      id,
      {
        "segment_status": "Regenerate Short",
        "previous_segment_status": "Requested Regenerate Short"
      },
      () => {
        showNotification("Requested Update", "Regenerating Short Idea", "success");
      },
      () => {
        showNotification("Requested Update", "Failed to regenerate idea", "error");
      }
    );
  };

  return (
    <Card className="w-[400px] !border-green-500 !p-2 shadow-md">
      <Handle type="target" position={Position.Left} id={`${id}-in`} />
      <Handle type="source" position={Position.Right} id={`${id}-out`} />
      <CardHeader className="p-2">
        <CardTitle className="text-lg flex justify-between items-center">
          {data.segmentTitle}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <p className="text-sm text-emerald-600">{data.segmentSummary}</p>
        {isExpanded && (
          <div className="mt-2">
            <p className="text-xs text-gray-500">Short Idea: {data.shortIdea}</p>
            <div className="flex justify-between mt-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerateShortIdea}
                className="text-xs"
              >
                <RefreshCw size={14} className="mr-1" />
                Regenerate Idea
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateShort}
                className="text-xs"
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