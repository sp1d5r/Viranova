import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Analytics } from "../../../types/collections/Analytics";
import { Comment } from "../../../types/collections/Comments";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ShortAnalyticsProps {
  shortId: string;
  analytics: Analytics[];
  comments: Comment[];
}

const ShortAnalytics: React.FC<ShortAnalyticsProps> = ({ shortId, analytics, comments }) => {
  const latestAnalytics = analytics.sort((a, b) => b.taskTime.toMillis() - a.taskTime.toMillis())[0];
  const videoAnalytics = latestAnalytics?.videoAnalytics[0];

  const engagementData = [
    { name: 'Likes', value: videoAnalytics?.diggCount || 0 },
    { name: 'Comments', value: videoAnalytics?.commentCount || 0 },
    { name: 'Shares', value: videoAnalytics?.shareCount || 0 },
    { name: 'Views', value: videoAnalytics?.playCount || 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics for Short: {shortId}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Engagement Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Recent Comments</h3>
          <ul className="space-y-2">
            {comments.slice(0, 5).map(comment => (
              <li key={comment.id} className="border-b pb-2">
                <p>{comment.text}</p>
                <p className="text-sm text-gray-500">Likes: {comment.likes}</p>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShortAnalytics;