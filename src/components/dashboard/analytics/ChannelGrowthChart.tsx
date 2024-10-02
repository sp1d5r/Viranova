import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Analytics } from "../../../types/collections/Analytics";

interface ChannelGrowthChartProps {
  analytics: Analytics[];
}

const ChannelGrowthChart: React.FC<ChannelGrowthChartProps> = ({ analytics }) => {
  const data = analytics
    .map(a => ({
      date: a.taskTime.toDate(),
      fans: a.videoAnalytics[0]?.authorMeta?.fans || 0,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Growth Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(date) => date.toLocaleDateString()} />
            <YAxis />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
              formatter={(value: number) => [value.toLocaleString(), 'Fans']}
            />
            <Line type="monotone" dataKey="fans" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ChannelGrowthChart;