import React from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { ShortNodeData } from '../../../../types/Catalog';

export const ShortNode: React.FC<{ data: ShortNodeData }> = ({ data }) => (
  <Card className="w-[250px]">
    <Handle type="target" position={Position.Left} id="short-in" />
    <CardHeader>
      <CardTitle className="text-yellow-800">{data.short_idea}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-yellow-600">Views: {data.views}</p>
      <p className="text-sm text-yellow-600">Likes: {data.likes}</p>
    </CardContent>
  </Card>
);