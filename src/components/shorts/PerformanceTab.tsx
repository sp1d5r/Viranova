import React, { useState } from "react";
import { Short } from "../../types/collections/Shorts";
import { TasksTab } from "./performance-tab/TasksTab";
import { AnalyticsTab } from "./performance-tab/AnalyticsTab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export interface PerformanceTabProps {
  short: Short;
  shortId: string;
}

type PerformanceTabTypes = 'Tasks' | 'Analytics';
const allTabs: PerformanceTabTypes[] = ['Tasks', 'Analytics'];

export const PerformanceTab: React.FC<PerformanceTabProps> = ({ short, shortId }) => {
  const [activeTab, setActiveTab] = useState<PerformanceTabTypes>('Tasks');

  return (
    <div className="w-full">
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PerformanceTabTypes)}>
          <TabsList className="grid w-full grid-cols-2">
            {allTabs.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="Tasks">
            <div>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>Manage tasks related to this short.</CardDescription>
              </CardHeader>
              <TasksTab shortId={shortId} />
            </div>
          </TabsContent>
          <TabsContent value="Analytics">
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>View analytics for this short.</CardDescription>
            </CardHeader>
            <AnalyticsTab shortId={shortId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </div>
  );
};