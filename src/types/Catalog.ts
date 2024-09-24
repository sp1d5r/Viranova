import { Node as ReactFlowNode } from 'reactflow';
import { Channel } from './collections/Channels';
import { UserVideo } from './collections/UserVideo';
import { Segment } from './collections/Segment';
import { Short } from './collections/Shorts';

export interface ChannelNodeData extends Channel {
    nodeId: string;
    y: number;
    x: number;
}

export interface VideoNodeData extends UserVideo {
    nodeId: string;
    y: number;
    x: number;
}

export interface SegmentNodeData extends Segment {
    nodeId: string;
    y: number;
    x: number;
}

export interface ShortNodeData extends Short{
    nodeId: string;
    y: number;
    x: number;
}

export type NodeData = ChannelNodeData | VideoNodeData | SegmentNodeData | ShortNodeData;

export interface Node extends ReactFlowNode {
  data: NodeData;
  type: 'channel' | 'video' | 'segment' | 'short';
}