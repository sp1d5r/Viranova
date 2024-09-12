import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "../../../../ui/card";
import {Badge} from "../../../../ui/badge";
import {AssetVideo} from "../../../../../types/collections/AssetVideo";

export const VideoGrid: React.FC<{ videos: AssetVideo[] }> = ({ videos }) => (
  <div className="grid grid-cols-3 gap-4">
    {videos.map((video) => (
      <Card key={video.id}>
        <CardHeader>
          <div className="bg-muted h-48 flex items-center justify-center mb-2">
            400 x 400
          </div>
          <CardTitle>{video.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{video.description}</p>
          <div className="flex justify-between mt-2">
            <div className="flex flex-wrap gap-1">
              {video.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">used in {video.usedIn} shorts</span>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);