import React from "react";
import {Input} from "../../../../ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "../../../../ui/popover";
import {Button} from "../../../../ui/button";
import {Filter, X} from "lucide-react";
import {Label} from "../../../../ui/label";
import {Checkbox} from "../../../../ui/checkbox";
import {AssetVideo} from "../../../../../types/collections/AssetVideo";


export const SearchAndFilter: React.FC<{
  videos: AssetVideo[],
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSource: string | null;
  setSelectedSource: (source: string | null) => void;
}> = ({ videos, searchTerm, setSearchTerm, selectedTags, setSelectedTags, selectedSource, setSelectedSource }) => {
  const sources = ['From Video', 'Upload', 'Stock'];
  const categories = ['Your Library', 'Archived', 'Favorites', 'Recent', 'Shared'];
  const allTags = Array.from(new Set(videos.flatMap(video => video.tags)));

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedSource(null);
    setSelectedTags([]);
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex gap-4">
        <Input
          type="search"
          placeholder="Search videos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Filters</h4>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" /> Clear filters
                </Button>
              </div>
              <div>
                <Label className="mb-2 block">Tabs</Label>
                <div className="flex flex-col gap-1">
                  {sources.map(source => (
                    <div key={source} className="flex items-center space-x-2">
                      <Checkbox
                        id={source}
                        checked={selectedSource === source}
                        onCheckedChange={() => setSelectedSource(source === selectedSource ? null : source)}
                      />
                      <Label htmlFor={source}>{source}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Categories</Label>
                <div className="flex flex-col gap-1">
                  {categories.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedSource === category}
                        onCheckedChange={() => setSelectedSource(category === selectedSource ? null : category)}
                      />
                      <Label htmlFor={category}>{category}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={() => handleTagToggle(tag)}
                      />
                      <Label htmlFor={tag}>{tag}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
