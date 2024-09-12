import React, {useState} from "react";
import {AssetVideo} from "../../../../../types/collections/AssetVideo";
import {VideoGrid} from "./VideoGrid";
import {SearchAndFilter} from "./SearchAndFilter";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../../../ui/select";
import {Button} from "../../../../ui/button";

const Pagination: React.FC<{ totalItems: number }> = ({ totalItems }) => (
  <div className="mt-4 flex justify-between items-center">
    <span className="text-sm text-muted-foreground">1-{totalItems} of {totalItems} row(s) shown</span>
    <div className="flex items-center gap-2">
      <Select defaultValue="10">
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Rows" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10 rows</SelectItem>
          <SelectItem value="20">20 rows</SelectItem>
          <SelectItem value="50">50 rows</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex">
        <Button variant="outline" size="icon"><span className="sr-only">First page</span>&lt;&lt;</Button>
        <Button variant="outline" size="icon"><span className="sr-only">Previous page</span>&lt;</Button>
        <Button variant="outline" size="icon"><span className="sr-only">Next page</span>&gt;</Button>
        <Button variant="outline" size="icon"><span className="sr-only">Last page</span>&gt;&gt;</Button>
      </div>
    </div>
  </div>
);

export const YourLibrary: React.FC<{videos: AssetVideo[]}> = ({videos}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const filteredVideos : AssetVideo[] = videos.filter(video =>
    (video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedTags.length === 0 || selectedTags.some(tag => video.tags.includes(tag))) &&
    (!selectedSource || video.source === selectedSource || selectedSource === 'Your Library')
  );

  return (
    <div>
      <SearchAndFilter
        videos={videos}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
      />
      <VideoGrid videos={filteredVideos} />
      <Pagination totalItems={filteredVideos.length} />
    </div>
  );
};