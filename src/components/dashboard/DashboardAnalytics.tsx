import React, { useEffect, useState } from 'react';
import { useNotification } from "../../contexts/NotificationProvider";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { DatePickerWithRange } from "../ui/date-picker-with-range";
import { MultiSelect } from "../ui/mutli-select";
import { DateRange } from "react-day-picker";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { TrendingUp } from 'lucide-react';

export interface DashboardAnalyticsProps {
  userId: string | undefined;
}

const chartData = [
  { date: "2024-04-01", views: 372, likes: 150, comments: 50 },
  { date: "2024-04-02", views: 277, likes: 180, comments: 60 },
  // ... Add more data points here
];

const recentVideos = [
  { id: '1', title: 'How to Code in React', views: 1000 },
  { id: '2', title: 'JavaScript Tips and Tricks', views: 800 },
  { id: '3', title: 'Building a REST API', views: 1200 },
];


const chartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--chart-1))",
  },
  likes: {
    label: "Likes",
    color: "hsl(var(--chart-2))",
  },
  comments: {
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


export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({userId}) => {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>("views");

  const total = React.useMemo(
    () => ({
      views: chartData.reduce((acc, curr) => acc + curr.views, 0),
      likes: chartData.reduce((acc, curr) => acc + curr.likes, 0),
      comments: chartData.reduce((acc, curr) => acc + curr.comments, 0),
    }),
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        return;
      }
      setIsLoading(true);
      try {
        // Fetch your data here
        // Example: const data = await fetchAnalyticsData(userId, dateRange, selectedVideos);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        showNotification("Error", "Failed to load analytics data", "error");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, dateRange, selectedVideos, showNotification]); // Added showNotification to the dependency array

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex flex-1 flex-col p-4 md:p-8 max-w-[100vw]">
      <div className="flex justify-between items-center mb-4">
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
                    {total[chart].toLocaleString()}
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
            <BarChart
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
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                  />
                }
              />
              <Bar dataKey={activeChart} fill={chartConfig[activeChart].color} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <p className="text-2xl font-bold m-2 my-4">Most Recent Videos</p>
      <div className="flex flex-wrap">
        <div className="w-full md:w-1/2 lg:w-2/3 p-2 h-full">
          <Card className="h-full overflow-auto">
            <CardHeader>
              <CardTitle>Select a Video</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {recentVideos.map((video) => (
                  <AccordionItem key={video.id} value={video.id}>
                    <AccordionTrigger>{video.title}</AccordionTrigger>
                    <AccordionContent>
                      <p>Views: {video.views}</p>
                      {/* Add more video details here */}
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

    </main>
  );
};

export default DashboardAnalytics;