import React, { useEffect, useMemo, useState } from 'react';
import { useNotification } from "../../contexts/NotificationProvider";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ScatterChart, Scatter, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { DatePickerWithRange } from "../ui/date-picker-with-range";
import { MultiSelect } from "../ui/mutli-select";
import { DateRange } from "react-day-picker";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Clock, Hash, TrendingUp } from 'lucide-react';
import { VideoAnalytics } from '../../types/collections/Analytics';
import { CumulativeShortAnalytics, ShortAnalytics, useAnalytics } from '../../contexts/AnalyticsProvider';
import { VideoPlayer } from '../video-player/VideoPlayer';

export interface DashboardAnalyticsProps {
  userId: string | undefined;
}

const chartData = [
  { date: "2024-04-01", views: 372, likes: 150, comments: 50 },
  { date: "2024-04-02", views: 277, likes: 180, comments: 60 },
  // ... Add more data points here
];


const chartConfig = {
  playCount: {
    label: "Views",
    color: "hsl(var(--chart-1))",
  },
  diggCount: {
    label: "Likes",
    color: "hsl(var(--chart-2))",
  },
  commentCount: {
    label: "Comments",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;


export const description = "A donut chart"

const pieChartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
]

const pieChartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig


const timeToUploadData = [
  { hours: 2, views: 1000 },
  { hours: 4, views: 2000 },
  { hours: 6, views: 3500 },
  { hours: 8, views: 2800 },
  { hours: 12, views: 1500 },
  { hours: 24, views: 1000 },
];

const hashtagChartConfig = {
  avgViews: {
    label: "Average Views",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const hashtagViewsData = [
  { hashtag: "#coding", avgViews: 5000 },
  { hashtag: "#webdev", avgViews: 4200 },
  { hashtag: "#javascript", avgViews: 3800 },
  { hashtag: "#react", avgViews: 3500 },
  { hashtag: "#tutorial", avgViews: 3000 },
];

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({userId}) => {
  const { showNotification } = useNotification();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [selectedShortAnalytics, setSelectedShortAnalytics] = useState<ShortAnalytics | null>(null);

  const { 
    shorts, 
    selectedShortId, 
    setSelectedShortId, 
    getDailyAnalytics,
    getTotalMetrics,
    getCumulativeAnalytics,
    getShortAnalytics,
    isLoading, 
    error 
  } = useAnalytics();

  const [activeChart, setActiveChart] = useState<'playCount' | 'diggCount' | 'commentCount'>('playCount');

  const chartData = useMemo(() => {
    return getCumulativeAnalytics(activeChart);
  }, [getCumulativeAnalytics, activeChart]);
  
  const total = useMemo(() => {
    return getTotalMetrics;
  }, [getTotalMetrics]);


  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex flex-1 flex-col p-4 md:p-8 max-w-[100vw]">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex space-x-4">
        <DatePickerWithRange
          date={dateRange}
          onDateChange={setDateRange}
        />
          <MultiSelect
            options={[
              { value: "video1", label: "Video 1" },
              { value: "video2", label: "Video 2" },
              { value: "video3", label: "Video 3" },
            ]}
            onValueChange={setSelectedVideos}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle>Analytics Overview</CardTitle>
            <CardDescription>
              Showing total metrics for the selected date range
            </CardDescription>
          </div>
          <div className="flex">
            {Object.keys(chartConfig).map((key) => {
              const chart = key as keyof typeof chartConfig;
              return (
                <button
                  key={chart}
                  data-active={activeChart === chart}
                  className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                  onClick={() => setActiveChart(chart)}
                >
                  <span className="text-xs text-muted-foreground">
                    {chartConfig[chart].label}
                  </span>
                  <span className="text-lg font-bold leading-none sm:text-3xl">
                    {total[chart].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
                </button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey={activeChart}
                  />
                }
              />
              <Line
                dataKey={`metrics.${activeChart}`}
                type="monotone"
                stroke={`var(--color-${activeChart})`}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <p className="text-2xl font-bold m-2 my-4">Most Recent Videos</p>
      <div className="flex flex-wrap">
      <div className="w-full md:w-1/2 lg:w-2/3 p-2 h-[400px]">
          <Card className="h-full overflow-auto">
            <CardHeader>
              <CardTitle>Select a Video</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion 
                type="single" 
                collapsible 
                className="w-full h-full overflow-y-scroll"
                onValueChange={(value) => {
                  if (value) {
                    const analytics = getShortAnalytics(value);
                    setSelectedShortAnalytics(analytics);
                  } else {
                    setSelectedShortAnalytics(null);
                  }
                }}
              >
                {shorts.map((video) => (
                  <AccordionItem key={video.id} value={video.id}>
                    <AccordionTrigger>
                      <div className="flex items-center w-full">
                        <div className="w-24 h-24 mr-4 overflow-hidden rounded-md">
                          {video.finished_short_location ? (
                            <VideoPlayer
                              path={video.finished_short_location}
                              className="w-full h-full object-cover"
                              loadingText="Loading..."
                              autoPlay={false}
                              controls={false}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <p className="text-sm text-gray-500">No preview</p>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow text-left">
                          <p className="font-semibold">{video.short_idea.substring(0,100)}</p>
                          <p className="text-sm text-muted-foreground">Views: {getShortAnalytics(video.id)?.totalViews || 0}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {selectedShortAnalytics && (
                        <div className="mt-4">
                          <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                          <div className="h-64 mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={selectedShortAnalytics.dailyMetrics}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                                <YAxis />
                                <Tooltip labelFormatter={(label) => new Date(label).toLocaleDateString()} />
                                <Legend />
                                <Line type="monotone" dataKey="views" stroke="#8884d8" />
                                <Line type="monotone" dataKey="likes" stroke="#82ca9d" />
                                <Line type="monotone" dataKey="comments" stroke="#ffc658" />
                                <Line type="monotone" dataKey="shares" stroke="#ff7300" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold">Hashtags</h4>
                              <p>{selectedShortAnalytics.hashtags.join(', ') || 'No hashtags'}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold">Music</h4>
                              <p>{selectedShortAnalytics.music}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
        <div className="w-full md:w-1/2 lg:w-1/3 p-2 h-full">
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Comment Tags</CardTitle>
            <CardDescription>January - June 2024</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={pieChartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={pieChartData}
                  dataKey="visitors"
                  nameKey="browser"
                  innerRadius={60}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing total visitors for the last 6 months
            </div>
          </CardFooter>
        </Card>
        </div>
      </div>

      <p className="text-2xl font-bold m-2 my-4">Metadata Analysis</p>
      <div className="flex flex-wrap">
        <div className="w-full md:w-1/2 p-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Time to Upload vs Views</CardTitle>
              <CardDescription>Correlation between upload time after YouTube video and Short views</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-[90%] m-auto">
                <ScatterChart margin={{ right: 20, left: 20, top: 20, bottom: 20 }}>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="hours" name="Hours to upload Short" unit="h" />
                  <YAxis type="number" dataKey="views" name="Views" unit=" views" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter name="Time to Upload vs Views" data={timeToUploadData} fill="#8884d8" />
                </ScatterChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none">
                <Clock className="h-4 w-4" /> Optimal upload time: 4-8 hours after YouTube video
              </div>
            </CardFooter>
          </Card>
        </div>
        <div className="w-full md:w-1/2 p-2">
          <Card>
            <CardHeader>
              <CardTitle>Hashtags Performance</CardTitle>
              <CardDescription>Average views per hashtag</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={hashtagChartConfig}>
                <BarChart
                  accessibilityLayer
                  data={hashtagViewsData}
                  layout="vertical"
                  margin={{
                    left: -20,
                  }}
                >
                  <XAxis type="number" dataKey="avgViews" hide />
                  <YAxis
                    dataKey="hashtag"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(1)} // Remove the '#' symbol
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="avgViews" fill={hashtagChartConfig.avgViews.color} radius={5} />
                </BarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="flex gap-2 font-medium leading-none">
                Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
              </div>
              <div className="leading-none text-muted-foreground">
                Showing average views for top hashtags
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

    </main>
  );
};

export default DashboardAnalytics;