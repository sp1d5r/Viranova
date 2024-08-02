import React, { useEffect, useState } from 'react';
import FirebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import { documentToShort, Short } from "../../types/collections/Shorts";
import { toNumber } from "lodash";
import { Analytics, VideoAnalytics } from "../../types/collections/Analytics";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useNotification } from "../../contexts/NotificationProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";

export interface DashboardAnalyticsProps {
  userId: string | undefined;
}

type ChartConfig = {
  [key: string]: {
    label: string;
    color: string;
  };
};

const chartConfig: ChartConfig = {
  commentCount: {
    label: 'Comments',
    color: 'hsl(var(--chart-1))',
  },
  diggCount: {
    label: 'Likes',
    color: 'hsl(var(--chart-2))',
  },
  shareCount: {
    label: 'Shares',
    color: 'hsl(var(--chart-3))',
  },
  playCount: {
    label: 'Plays',
    color: 'hsl(var(--chart-4))',
  },
  fans: {
    label: 'Fans',
    color: 'hsl(var(--chart-1))',
  },
  heart: {
    label: 'Hearts',
    color: 'hsl(var(--chart-2))',
  },
  video: {
    label: 'Videos',
    color: 'hsl(var(--chart-3))',
  },
};

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({ userId }) => {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [selectedShort, setSelectedShort] = useState<string | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (userId) {
      FirebaseFirestoreService.queryDocuments(
        '/shorts',
        'uid',
        userId,
        'last_updated',
        (documents) => {
          setShorts(documents.map(doc => documentToShort(doc))
            .sort((elem1, elem2) => toNumber(elem2.last_updated) - toNumber(elem1.last_updated)));
          showNotification("Success", "Short data collected!", "success");
        },
        (error) => {
          showNotification("Error", error.message, "error");
        }
      );
    }
  }, [userId]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const allAnalytics: Analytics[] = [];
      for (const short of shorts) {
        await new Promise<void>((resolve) => {
          FirebaseFirestoreService.queryDocuments<Analytics>(
            'analytics',
            'shortId',
            short.id,
            'taskTime',
            (docs) => {
              if (docs.length > 0) {
                allAnalytics.push(...docs);
              }
              resolve();
            },
            (error) => {
              showNotification("Error", error.message, "error");
              console.log(error)
            }
          );
        });
      }
      setAnalytics(allAnalytics);
    };

    if (shorts.length > 0) {
      fetchAnalytics();
    }
  }, [shorts]);

  const prepareChartData = (metric: keyof VideoAnalytics | keyof VideoAnalytics['authorMeta']) => {
    if (selectedShort) {
      return analytics
        .filter(a => a.shortId === selectedShort)
        .map(a => ({
          name: a.taskTime.toDate().toLocaleDateString(),
          value: metric in a.videoAnalytics[0]
            ? a.videoAnalytics[0][metric as keyof VideoAnalytics]
            : a.videoAnalytics[0].authorMeta[metric as keyof VideoAnalytics['authorMeta']]
        }));
    } else {
      const shortMap = new Map<string, VideoAnalytics>();
      analytics.forEach(a => {
        if (!shortMap.has(a.shortId) || a.taskTime.toDate() > new Date(shortMap.get(a.shortId)!.createTimeISO)) {
          shortMap.set(a.shortId, a.videoAnalytics[0]);
        }
      });
      return Array.from(shortMap.entries()).map(([shortId, videoAnalytics]) => ({
        name: shortId,
        value: metric in videoAnalytics
          ? videoAnalytics[metric as keyof VideoAnalytics]
          : videoAnalytics.authorMeta[metric as keyof VideoAnalytics['authorMeta']]
      }));
    }
  };

  const prepareFansData = () => {
    const shortMap = new Map<string, VideoAnalytics>();
    analytics.forEach(a => {
      if (!shortMap.has(a.shortId) || a.taskTime.toDate() > new Date(shortMap.get(a.shortId)!.createTimeISO)) {
        shortMap.set(a.shortId, a.videoAnalytics[0]);
      }
    });
    return Array.from(shortMap.entries()).map(([shortId, videoAnalytics]) => ({
      name: shortId,
      fans: videoAnalytics.authorMeta.fans,
      following: videoAnalytics.authorMeta.following
    }));
  };

  const renderChart = (metric: keyof typeof chartConfig) => (
    <Card key={metric}>
      <CardHeader>
        <CardTitle>{chartConfig[metric].label}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={prepareChartData(metric as keyof VideoAnalytics | keyof VideoAnalytics['authorMeta'])}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="value" stroke={chartConfig[metric].color} fill={chartConfig[metric].color} fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  return (
    <main className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <Select onValueChange={(value) => setSelectedShort(value === "null" ? null : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a short" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="null">All Shorts</SelectItem>
            {shorts.map(short => (
              <SelectItem key={short.id} value={short.id}>{short.id}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setSelectedShort(null)}>View All Shorts</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(chartConfig).map(metric =>
          metric !== 'fans' && renderChart(metric as keyof typeof chartConfig)
        )}
        <Card>
          <CardHeader>
            <CardTitle>Fans and Following</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={prepareFansData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="fans" fill={chartConfig.fans.color} />
                <Bar dataKey="following" fill={chartConfig.heart.color} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default DashboardAnalytics;