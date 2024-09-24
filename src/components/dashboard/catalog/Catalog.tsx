import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  MarkerType,
  NodeProps,
  useReactFlow,
  useOnSelectionChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { VideoNode } from './nodes/VideoNode';
import { SegmentNode } from './nodes/SegmentNode';
import { ShortNode } from './nodes/ShortNode';
import { ChannelNode } from './nodes/ChannelNode';
import { ChannelNodeData, Node, NodeData, SegmentNodeData, ShortNodeData, VideoNodeData } from '../../../types/Catalog';
import { Channel, ChannelsTracking } from '../../../types/collections/Channels';
import FirebaseDatabaseService from '../../../services/database/strategies/FirebaseFirestoreService';
import { useAuth } from '../../../contexts/Authentication';
import { Button } from '../../ui/button';
import { Eraser, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';

const nodeTypes = {
  video: (props: NodeProps) => VideoNode({ ...props, data: props.data as VideoNodeData }),
  segment: SegmentNode,
  short: ShortNode,
  channel: (props: NodeProps) => ChannelNode({ ...props, data: props.data as ChannelNodeData }),
};

const initialNodes: Node[] = [
];

const initialEdges: Edge[] = [
];

const DataCatalog: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [channels, setChannels] = useState<Channel[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { authState } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedNodesCount, setSelectedNodesCount] = useState(0);

  const onChange = useCallback(({ nodes, edges }: { nodes: any[]; edges: any[] }) => {
    setSelectedNodesCount(nodes.length);
  }, []);

  useOnSelectionChange({
    onChange,
  });
  
  useEffect(() => {
    if (authState.user) {
      setUserId(authState.user.uid);
    }
  }, [authState])

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const fetchChannels = async () => {
      try {
        if (userId){
          unsubscribe = FirebaseDatabaseService.listenToDocument<ChannelsTracking>(
            'channelstracking',
            userId,
            async (data) => {
              if (data && data.channelsTracking) {
                const channelPromises = data.channelsTracking.map(channelId =>
                  new Promise<Channel>((resolve, reject) => {
                    FirebaseDatabaseService.getDocument<Channel>(
                      'channels',
                      channelId,
                      (channelData) => {
                        if (channelData) {
                          resolve({ ...channelData, channelId });
                        } else {
                          reject(new Error(`Channel ${channelId} not found`));
                        }
                      },
                      (error) => reject(error)
                    );
                  })
                );
                const fetchedChannels = await Promise.all(channelPromises);
                console.log(fetchedChannels);
                setChannels(fetchedChannels);
              } else {
                setChannels([]);
              }
            },
            (error) => {
              console.error("Error fetching channels:", error);
              setFetchError("Failed to fetch channels. Please try again.");
            }
          );
        }
      } catch (error) {
        console.error("Error setting up channel listener:", error);
        setFetchError("Failed to set up channel updates. Please refresh the page.");
      }
    };

    fetchChannels();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId]);

  useEffect(() => {
    // Create channel nodes based on fetched channels
    const channelNodes: Node[] = channels.map((channel, index) => ({
      id: `channel-${channel.channelId}`,
      type: 'channel',
      position: { x: -200, y: index * 250 }, // Adjust positioning as needed
      data: {
        ...channel,
        nodeId: `channel-${channel.channelId}`,
        y: index * 150,
        x: -200,
      } as ChannelNodeData,
    }));

    // Update nodes state with new channel nodes
    setNodes((prevNodes) => {
      // Remove existing channel nodes
      const nonChannelNodes = prevNodes.filter((node) => node.type !== 'channel');
      return [...nonChannelNodes, ...channelNodes];
    });
  }, [channels, setNodes]);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const [availableChannels, setAvailableChannels] = useState<Channel[]>([]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const fetchAvailableChannels = async () => {
      try {
        if (userId) {
          unsubscribe = FirebaseDatabaseService.listenToDocument<ChannelsTracking>(
            'channelstracking',
            userId,
            async (data) => {
              if (data && data.channelsTracking) {
                const channelPromises = data.channelsTracking.map(channelId =>
                  new Promise<Channel>((resolve, reject) => {
                    FirebaseDatabaseService.getDocument<Channel>(
                      'channels',
                      channelId,
                      (channelData) => {
                        if (channelData) {
                          resolve({ ...channelData });
                        } else {
                          reject(new Error(`Channel ${channelId} not found`));
                        }
                      },
                      (error) => reject(error)
                    );
                  })
                );
                const fetchedChannels = await Promise.all(channelPromises);
                setAvailableChannels(fetchedChannels);
              } else {
                setAvailableChannels([]);
              }
            },
            (error) => {
              console.error("Error fetching channels:", error);
            }
          );
        }
      } catch (error) {
        console.error("Error setting up channel listener:", error);
      }
    };

    fetchAvailableChannels();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId]);

  const addChannelToGraph = useCallback((channel: Channel) => {
    setNodes((prevNodes) => [
      ...prevNodes,
      {
        id: `channel-${channel.channelId}`,
        type: 'channel',
        position: { x: 0, y: prevNodes.length * 350 },
        data: {
          ...channel,
          nodeId: `channel-${channel.channelId}`,
          y: prevNodes.length * 350,
          x: 0,
        } as ChannelNodeData,
      },
    ]);
  }, [setNodes]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        snapToGrid={true}
        fitView
      >
        <Controls />
        <Background />
        <Panel position="top-left" className="m-2 flex gap-2 items-center">
            <Button variant="outline" onClick={() => setNodes([])}>
                <Eraser className="h-4 w-4 mr-2" />
                Clear</Button>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline">Add Channel</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="space-y-2">
                        <h3 className="font-medium">Available Channels</h3>
                        {availableChannels.map((channel) => (
                            <div key={channel.channelId} className="flex justify-between items-center">
                                <span>{channel.title}</span>
                                <Button
                                    size="sm"
                                    onClick={() => addChannelToGraph(channel)}
                                    disabled={nodes.some((node) => node.id === `channel-${channel.channelId}`)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </Panel>
        <Panel position="top-right" className="m-2 flex gap-2 items-center">
            <Label>Create Composite Short</Label>
            <Input placeholder="Prompt" />
            <Button>
                <Plus className="h-4 w-4" />
            </Button>
        </Panel>
        <Panel position="bottom-right" className="m-2">
          <div className="text-white p-2 rounded shadow border-white border-2">
            Selected Nodes: {selectedNodesCount}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default DataCatalog;