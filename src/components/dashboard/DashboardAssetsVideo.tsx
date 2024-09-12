import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {sampleVideos} from "../../types/collections/AssetVideo";
import {YourLibrary} from "./assets/videos/your-library/YourLibrary";

// Placeholder components for other tabs
const FromVideo: React.FC = () => <div>From Video Content</div>;
const Upload: React.FC = () => <div>Upload Content</div>;
const Stock: React.FC = () => <div>Stock Content</div>;

// Main DashboardAssetVideo component
const DashboardAssetVideo: React.FC = () => {
  return (
    <div className="bg-background text-foreground p-6">
      <h1 className="text-2xl font-bold mb-4">Videos</h1>
      <p className="mb-4">
        Video assets are the most important feature of your videos. Use this area to collect clips from longer length videos and keep them stored for use in clips. A popular format is the "Top 5 XXXXXX from YYYYYYY"
      </p>

      <Tabs defaultValue="your-library">
        <TabsList>
          <TabsTrigger value="your-library">Your Library</TabsTrigger>
          <TabsTrigger value="from-video">From Video</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
        </TabsList>
        <TabsContent value="your-library">
          <YourLibrary videos={sampleVideos} />
        </TabsContent>
        <TabsContent value="from-video">
          <FromVideo />
        </TabsContent>
        <TabsContent value="upload">
          <Upload />
        </TabsContent>
        <TabsContent value="stock">
          <Stock />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardAssetVideo;