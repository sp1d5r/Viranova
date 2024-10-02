import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Short } from "../../../types/collections/Shorts";
import { Analytics } from "../../../types/collections/Analytics";

interface VideoGrowthChartProps {
  shorts: Short[];
  analytics: Analytics[];
}

const VideoGrowthChart: React.FC<VideoGrowthChartProps> = ({ shorts, analytics }) => {
  const data = shorts.map(short => {
    const latestAnalytics = analytics
      .filter(a => a.shortId === short.id)
      .sort((a, b) => b.taskTime.toMillis() - a.taskTime.toMillis())[0];

    return {
      date: short.last_updated.toDate(),
      views: latestAnalytics?.videoAnalytics[0]?.playCount || 0,
    };
  }).sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Growth Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(date) => date.toLocaleDateString()} />
            <YAxis />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
              formatter={(value: number) => [value.toLocaleString(), 'Views']}
            />
            <Area type="monotone" dataKey="views" stroke="#8884d8" fill="#8884d8" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default VideoGrowthChart;