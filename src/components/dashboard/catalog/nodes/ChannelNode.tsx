import React, { useCallback, useState } from 'react';
import { Edge, Handle, MarkerType, Position, useReactFlow, Node } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { ChannelNodeData, VideoNodeData } from '../../../../types/Catalog';
import { ArrowLeft, ArrowRight, XIcon } from 'lucide-react'; 
import FirebaseDatabaseService from '../../../../services/database/strategies/FirebaseFirestoreService';
import { UserVideo } from '../../../../types/collections/UserVideo';
import { Avatar, AvatarFallback, AvatarImage } from '../../../ui/avatar';
import { Button } from '../../../ui/button';

interface ChannelNodeProps {
  data: ChannelNodeData;
  id: string;
  xPos: number;
  yPos: number;
  selected: boolean;
}

export const ChannelNode: React.FC<ChannelNodeProps> = ({ data, id, xPos, yPos, selected }) => {
    const { setNodes, setEdges } = useReactFlow();
    const [videos, setVideos] = useState<UserVideo[]>([]);

    const handleDelete = useCallback(() => {
        console.log('Deleting node:', id);

        setNodes((nodes) => {
            const updatedNodes = nodes.filter((node) => node.id !== id);
            console.log('Nodes after deletion:', updatedNodes);
            return updatedNodes;
        });

        // Remove edges connected to this node
        setEdges((edges) => {
            const updatedEdges = edges.filter((edge) => 
                edge.source !== id && edge.target !== id
            );
            console.log('Edges after deletion:', updatedEdges);
            return updatedEdges;
        });
    }, [id, setNodes, setEdges]);

    const toggleExpand = () => {
        if (videos.length > 0) {
            // Remove existing video nodes and edges
            setNodes((nds) => nds.filter((node) => !node.id.startsWith(`video-${data.channelId}`)));
            setEdges((eds) => eds.filter((edge) => !edge.id.startsWith(`e-${id}`)));
            setVideos([]);
        } else {
            FirebaseDatabaseService.queryDocuments<UserVideo>(
                'videos',
                'channelId',
                data.channelId,
                'uploadTimestamp',
                (userVideos) => {
                  if (userVideos) {
                    setVideos(userVideos);
                    const newNodes: Node[] = userVideos.map((video, index) => ({
                      id: `video-${data.channelId}-${video.id}`,
                      type: 'video',
                      position: { x: xPos + 400, y: yPos + (index - userVideos.length / 2) * 200 },
                      data: {
                        ...video,
                        x: xPos + 400,
                        y: yPos + (index - userVideos.length / 2) * 300,
                      } as VideoNodeData,
                    }));
          
                    const newEdges: Edge[] = newNodes.map((node) => ({
                      id: `e-${id}-${node.id}`,
                      source: id,
                      sourceHandle: `${id}-out`,
                      target: node.id,
                      targetHandle: `${node.id}-in`,
                      type: 'default',
                      markerEnd: { type: MarkerType.ArrowClosed },
                    }));
          
                    setNodes((nds: Node[]) => [...nds, ...newNodes]);
                    setEdges((eds: Edge[]) => [...eds, ...newEdges]);
                  }
                },
                (error) => {
                  console.error('Error loading related videos:', error);
                }
            );
        }
    };

    const formatNumber = (num: number | undefined) => {
        if (!num) return 'N/A';
        return num >= 1000000
            ? (num / 1000000).toFixed(1) + 'M'
            : num >= 1000
            ? (num / 1000).toFixed(1) + 'K'
            : num.toString();
    };

    return (
        <div className={`relative rounded-lg ${selected ? 'ring-2 ring-purple-500' : ''}`}>
            <Card className="w-[300px] !border-purple-500 !p-2 shadow-md">
                <Handle type="target" position={Position.Left} id={`${id}-in`} />
                <Handle type="source" position={Position.Right} id={`${id}-out`} />
                <CardHeader className="p-2">
                    <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                            <AvatarImage src={data.thumbnails?.default} alt={data.title} />
                            <AvatarFallback>{data.title?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-purple-800 text-lg">{data.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{data.customUrl}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <p className="font-semibold">Subscribers:</p>
                            <p>{data.subscriberCount}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Videos:</p>
                            <p>{data.videoCount}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Views:</p>
                            <p>{data.viewCount}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Country:</p>
                            <p>{data.country || 'N/A'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <button
                className="absolute translate-x-1/4 -right-10 top-1/4 transform -translate-y-1/2 bg-purple-500 hover:bg-purple-600 text-white rounded-full p-2 transition-colors duration-200"
                onClick={toggleExpand}
                title="Load related videos"
            >
                {videos.length > 0 ?  <ArrowLeft size={20} /> : <ArrowRight size={20} />}
            </button>
            <button
                className="absolute translate-x-1/4 -right-10 bottom-1/4 transform translate-y-1/2 bg-transparent hover:bg-red-500 border bg-red-500 text-white rounded-full p-2 transition-colors duration-200"
                onClick={handleDelete}
                title="Delete Node"
            >
                <XIcon size={20} />
            </button>
        </div>
    );
};