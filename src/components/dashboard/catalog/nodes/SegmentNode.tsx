import React from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { SegmentNodeData } from '../../../../types/Catalog';

export const SegmentNode: React.FC<{ data: SegmentNodeData }> = ({ data }) => (
  <Card className="w-[250px]">
    <Handle type="target" position={Position.Left} id="segment-in" />
    <Handle type="source" position={Position.Right} id="segment-out" />
    <CardHeader>
      <CardTitle className="text-green-800">{data.segmentTitle}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-green-600">{data.segmentSummary}</p>
    </CardContent>
  </Card>
);