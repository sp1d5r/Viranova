import React, { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '../../ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Analytics } from '../../../types/collections/Analytics';
import FirebaseFirestoreService from '../../../services/database/strategies/FirebaseFirestoreService';

const formatDate = (timestamp: { seconds: number }): string => {
  const date = new Date(timestamp.seconds * 1000);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

interface ProcessedDataPoint {
  date: string;
  comments: number;
  likes: number;
  shares: number;
  plays: number;
}

interface AuthorProcessedDataPoint {
  date: string;
  fans: number;
  heart: number;
  video: number;
  digg: number;
}

interface AnalyticsTabProps {
  shortId: string;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ shortId }) => {
  const [allAnalytics, setAllAnalytics] = useState<Analytics[]>([]);

  useEffect(() => {
    FirebaseFirestoreService.queryDocuments(
      'analytics',
      'shortId',
      shortId,
      'taskTime',
      (docs) => {
        setAllAnalytics(docs.map((elem) => elem as Analytics));
        console.log('docs: ', docs);
      },
      (error: Error) => {
        console.error(error.message);
      }
    );
  }, [shortId]);

  const processedData: ProcessedDataPoint[] = allAnalytics.map((analytic) => ({
    date: formatDate(analytic.taskTime),
    comments: analytic.videoAnalytics[0]?.commentCount || 0,
    likes: analytic.videoAnalytics[0]?.diggCount || 0,
    shares: analytic.videoAnalytics[0]?.shareCount || 0,
    plays: analytic.videoAnalytics[0]?.playCount || 0,
  }));

  const authorProcessedData: AuthorProcessedDataPoint[] = allAnalytics.map((analytic) => ({
    date: formatDate(analytic.taskTime),
    fans: analytic.videoAnalytics[0]?.authorMeta.fans || 0,
    heart: analytic.videoAnalytics[0]?.authorMeta.heart || 0,
    video: analytic.videoAnalytics[0]?.authorMeta.video || 0,
    digg: analytic.videoAnalytics[0]?.authorMeta.digg || 0,
  }));

  const chartConfig = {
    comments: {
      label: 'Comments',
      color: 'hsl(var(--chart-1))',
    },
    likes: {
      label: 'Likes',
      color: 'hsl(var(--chart-2))',
    },
    shares: {
      label: 'Shares',
      color: 'hsl(var(--chart-3))',
    },
    plays: {
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
    digg: {
      label: 'Diggs',
      color: 'hsl(var(--chart-4))',
    },
  } satisfies ChartConfig;

  const AnalyticsChart: React.FC<{ dataKey: keyof ProcessedDataPoint; title: string }> = ({ dataKey, title }) => (
    <Card className="w-[45%]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Analytics data over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[150px]">
          <AreaChart
            accessibilityLayer
            data={processedData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <defs>
              <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`var(--color-${dataKey})`} stopOpacity={0.8} />
                <stop offset="95%" stopColor={`var(--color-${dataKey})`} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis />
            <Tooltip content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey={dataKey}
              type="natural"
              fill={`url(#fill-${dataKey})`}
              stroke={`var(--color-${dataKey})`}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );

  const AuthorAnalyticsChart: React.FC<{ dataKey: keyof AuthorProcessedDataPoint; title: string }> = ({ dataKey, title }) => (
    <Card className="w-[45%]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Author analytics data over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[150px]">
          <AreaChart
            accessibilityLayer
            data={authorProcessedData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <defs>
              <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`var(--color-${dataKey})`} stopOpacity={0.8} />
                <stop offset="95%" stopColor={`var(--color-${dataKey})`} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis />
            <Tooltip content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey={dataKey}
              type="natural"
              fill={`url(#fill-${dataKey})`}
              stroke={`var(--color-${dataKey})`}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full gap-4 my-4 flex flex-col">
      <Tabs defaultValue="video">
        <TabsList>
          <TabsTrigger value="video">Video Analytics</TabsTrigger>
          <TabsTrigger value="channel">Author Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="video" className="flex gap-2 flex-col">
          <div className="flex gap-2 flex-wrap">
            <AnalyticsChart dataKey="comments" title="Comments Over Time" />
            <AnalyticsChart dataKey="likes" title="Likes Over Time" />
            <AnalyticsChart dataKey="shares" title="Shares Over Time" />
            <AnalyticsChart dataKey="plays" title="Video Plays Over Time" />
          </div>
          <CardFooter>
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="grid gap-2">
                <div className="flex items-center gap-2 font-medium leading-none">
                  Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                  January - June 2024
                </div>
              </div>
            </div>
          </CardFooter>
        </TabsContent>
        <TabsContent value="channel" className="flex gap-2 flex-col">
          <div className="flex gap-2 flex-wrap">
            <AuthorAnalyticsChart dataKey="fans" title="Fans Over Time" />
            <AuthorAnalyticsChart dataKey="heart" title="Hearts Over Time" />
            <AuthorAnalyticsChart dataKey="video" title="Videos Over Time" />
            <AuthorAnalyticsChart dataKey="digg" title="Diggs Over Time" />
          </div>
          <CardFooter>
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="grid gap-2">
                <div className="flex items-center gap-2 font-medium leading-none">
                  Profile <User className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                  {allAnalytics[0]?.videoAnalytics[0]?.authorMeta.nickName || 'Author'}
                </div>
              </div>
            </div>
          </CardFooter>
        </TabsContent>
      </Tabs>
    </div>
  );
};
