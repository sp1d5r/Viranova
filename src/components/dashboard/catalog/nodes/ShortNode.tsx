import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Short } from '../../../../types/collections/Shorts';
import { Button } from '../../../ui/button';
import { ArrowDown, ArrowUp, Eye, Heart, MessageCircle, Share2, Scissors, RefreshCw, ArrowLeft, ChartLine, Video, Ratio, XIcon, SquarePen } from 'lucide-react';
import { useNotification } from '../../../../contexts/NotificationProvider';
import FirebaseDatabaseService from '../../../../services/database/strategies/FirebaseFirestoreService';
import { Badge } from '../../../ui/badge';

export const ShortNode: React.FC<{ data: Short; id: string }> = ({ data, id }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { showNotification } = useNotification();

  const handleRegenerateShort = () => {
    console.log('here')
  };

  return (
    <div className="relative">
    <Card className="w-[300px] !border-pink-500 !p-2 shadow-md">
      <Handle type="target" position={Position.Left} id={`${id}-in`} />
      <CardHeader className="p-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span className="text-pink-500 truncate">{data.short_idea || "Untitled Short"}</span>
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
        <div className="flex justify-between items-center mb-2">
          <Badge variant="secondary" className="text-xs">
            {data.short_status}
          </Badge>
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Eye size={12} />
              {data.views || 0}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Heart size={12} />
              {data.likes || 0}
            </Badge>
          </div>
        </div>
        {isExpanded && (
          <div className="mt-2 space-y-2">
            <p className="text-xs text-muted-foreground truncate">
              Idea: {data.short_idea_explanation}
            </p>
            <p className="text-xs text-muted-foreground">
              Duration: {((data.end_index - data.start_index) / data.fps).toFixed(2)}s
            </p>
            <div className="flex justify-between items-center">
              <Badge variant="outline" className="flex items-center gap-1">
                <MessageCircle size={12} />
                {data.comments || 0}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Share2 size={12} />
                {data.shares || 0}
              </Badge>
            </div>
            {data.tiktok_link && (
              <a href={data.tiktok_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                View on TikTok
              </a>
            )}
            <div className="flex justify-between mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerateShort}
                className="text-xs"
              >
                <RefreshCw size={14} className="mr-1" />
                Regenerate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/shorts?short_id=${data.id}`, '_blank')}
                className="text-xs"
              >
                <Scissors size={14} className="mr-1" />
                Edit Short
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    <button
        className="absolute -translate-x-1/4 -left-10 top-1/4 transform -translate-y-1/2 bg-sky-500 hover:bg-blue-600 text-white rounded-full p-2 transition-colors duration-200"
        onClick={() => {}}
        title="Load video"
    >
        <Video size={20} />
    </button>
    <button
        className="absolute -translate-x-1/4 -left-10 bottom-1/4 transform translate-y-1/2 bg-transparent border-blue-500 hover:bg-blue-500 border text-white rounded-full p-2 transition-colors duration-200"
        onClick={() => {}}
        title="Delete Node"
    >
        <ArrowLeft size={20} />
    </button>
    <button
        className="absolute left-1/2 -translate-x-1/2 -bottom-10 transform translate-y-1/2 bg-transparent hover:bg-red-500 border border-red-500 text-white rounded-full p-2 transition-colors duration-200"
        onClick={() => {}}
        title="Load Segments"
    >
        <XIcon size={20} />
    </button>
    <div className='absolute translate-x-1/4 -right-10 top-1/4 transform -translate-y-1/2  flex flex-col gap-2 justify-center items-center'>
        <button
            className="border border-pink-500 hover:bg-pink-500 text-white rounded-full p-2 transition-colors duration-200"
            title="Load related shorts"
        >
            <ChartLine size={20} />
        </button>
        <button
            className="border border-pink-500 hover:bg-pink-500 text-white rounded-full p-2 transition-colors duration-200"
            onClick={() => {window.location.href = `/shorts?tab=attention-capture&short_id=${data.id}`}}
            title="Edit Transcript"
        >
            <SquarePen size={20} />
        </button>
        <button
            className="border border-pink-500 hover:bg-pink-500 text-white rounded-full p-2 transition-colors duration-200"
            onClick={() => {window.location.href = `/shorts?tab=attention-capture&short_id=${data.id}`}}
            title="Edit Visuals"
        >
            <Ratio size={20} />
        </button>
    </div>
    </div>
  );
};