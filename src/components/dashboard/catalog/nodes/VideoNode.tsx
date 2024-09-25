import React, { useCallback, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent } from '../../../ui/card';
import { VideoNodeData } from '../../../../types/Catalog';
import { Badge } from '../../../ui/badge';
import { Layers, Layers3, Loader2 } from 'lucide-react';
import { ArrowLeft, ArrowRight, XIcon } from 'lucide-react';
import { useReactFlow } from 'reactflow';
import { documentToShort, Short } from '../../../../types/collections/Shorts';
import FirebaseFirestoreService from '../../../../services/database/strategies/FirebaseFirestoreService';
import { useAuth } from '../../../../contexts/Authentication';
import { documentToSegment, Segment } from '../../../../types/collections/Segment';

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
    id: string;
    selected: boolean;
}

export const VideoNode: React.FC<VideoNodeProps> = ({ data, id, selected }) => {
    const { setNodes, setEdges } = useReactFlow();
    const [shorts, setShorts] = useState<Short[]>([]);
    const [segments, setSegments] = useState<Segment[]>([]);
    const { authState } = useAuth();

    const handleDelete = useCallback(() => {
        console.log('Deleting node:', id);

        setNodes((nodes) => nodes.filter((node) => node.id !== id));
        setEdges((edges) => edges.filter((edge) => 
            edge.source !== id && edge.target !== id
        ));
    }, [id, setNodes, setEdges]);


    const toggleSegments = () => {
        if (segments.length > 0) {  
            setNodes((nds) => nds.filter((node) => !node.id.startsWith(`segment-${id}`)));
            setEdges((eds) => eds.filter((edge) => !edge.id.startsWith(`e-segment-${id}`)));
            setSegments([]);
        } else {
            FirebaseFirestoreService.queryDocuments(
                '/topical_segments',
                'video_id',
                data.id,
                'index',
                (segments) => {
                    const newSegments = segments.map(documentToSegment);
                    setSegments(newSegments);
                    console.log(newSegments);
                    
                    // create nodes and edges for segments
                    const newNodes = newSegments.map((segment,index) => ({
                        id: `segment-${id}-${segment.id}`,
                        type: 'segment',
                        position: { x: data.x + 300, y: data.y + (index+2) * 200 },
                        data: { ...segment },
                    }));


                    // Map video to segments 
                    const newEdges = newNodes.map((node) => ({
                        id: `e-${id}-${node.id}`,
                        source: id,
                        target: node.id,
                        type: 'default',
                    }));

                    setNodes((nds) => [...nds, ...newNodes]);
                    setEdges((eds) => [...eds, ...newEdges]);
                },
                (error) => {
                    console.log(error.message);
                }
            )
        }
    }


    const toggleShorts = () => {
        if (shorts.length > 0) {
            // Remove existing short nodes and edges
            setNodes((nds) => nds.filter((node) => !node.id.startsWith(`short-${id}`)));
            setEdges((eds) => eds.filter((edge) => !edge.id.startsWith(`e-${id}`)));
            setShorts([]);
        } else {
                FirebaseFirestoreService.complexQuery<Short>(
                  '/shorts',
                  [
                    {
                        field: 'uid',
                        operator: '==',
                        value: authState.user && authState.user.uid ? authState.user.uid : '',
                    },
                    {
                        field: 'video_id',
                        operator: '==',
                        value: data.id,
                    }
                  ],
                  [
                    {
                        field: 'last_updated',
                        direction: 'desc',
                    }
                  ],
                  (shorts) => {

                    console.log(shorts);
                    // Sort the shorts array
                    const sortedShorts = shorts.sort((a, b) => {
                      // If both have last_updated, compare them
                      try{
                        if (a.last_updated && b.last_updated) {
                          return b.last_updated.toMillis() - a.last_updated.toMillis();
                        }
                      } catch {
                        return -1
                      }
            
                      // If only a has last_updated, it should come first
                      if (a.last_updated) return -1;
                      // If only b has last_updated, it should come first
                      if (b.last_updated) return 1;
                      // If neither has last_updated, maintain their original order
                      return 0;
                    });
            
                    setShorts(sortedShorts);
                    // Create nodes and edges for shorts
                    // This is a placeholder and should be adjusted based on your actual data structure
                    const newNodes = sortedShorts.map((short, index) => ({
                        id: `short-${id}-${index}`,
                        type: 'short',
                        position: { x: data.x + 1000, y: data.y + (index - sortedShorts.length / 2) * 150 },
                        data: { ...short },
                    }));

                    const newEdges = newNodes.map((node) => ({
                        id: `e-${id}-${node.id}`,
                        source: id,
                        target: node.id,
                        type: 'default',
                    }));

                    const newSegmentEdges = newNodes.map((node) => ({
                        id: `e-segment-${id}-${node.id}`,
                        source: `segment-${id}-${node.data.segment_id}`,
                        target: node.id,
                        type: 'default',
                    }));

                    setNodes((nds) => [...nds, ...newNodes]);
                    setEdges((eds) => [...eds, ...newEdges, ...newSegmentEdges]);
                  },
                  (error) => {
                    console.log(error.message)
                  }
                );
        }
    };

    return (
        <div className="relative">
            <Card className={`w-[250px] !border-sky-500 !p-2 shadow-md ${selected ? 'ring-2 ring-sky-500' : ''}`}>
                <Handle type="target" position={Position.Left} id={`${id}-in`} />
                <Handle type="source" position={Position.Right} id={`${id}-out`} />
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
            <button
                className="absolute translate-x-1/4 -right-10 top-1/4 transform -translate-y-1/2 bg-sky-500 hover:bg-blue-600 text-white rounded-full p-2 transition-colors duration-200"
                onClick={toggleShorts}
                title="Load related shorts"
            >
                {shorts.length > 0 ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
            </button>
            <button
                className="absolute translate-x-1/4 -right-10 bottom-1/4 transform translate-y-1/2 bg-transparent hover:bg-red-500 border bg-red-500 text-white rounded-full p-2 transition-colors duration-200"
                onClick={handleDelete}
                title="Delete Node"
            >
                <XIcon size={20} />
            </button>
            <button
                className="absolute left-1/2 -translate-x-1/2 -bottom-10 transform translate-y-1/2 bg-transparent hover:bg-emerald-500 border bg-emerald-500 text-white rounded-full p-2 transition-colors duration-200"
                onClick={toggleSegments}
                title="Load Segments"
            >
                {segments.length > 0 ? <Layers size={20} /> : <Layers3 size={20} />}
            </button>
        </div>
    )
};