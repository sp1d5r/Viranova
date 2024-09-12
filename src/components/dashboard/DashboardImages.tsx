import React, { useState } from 'react';
import { Slider } from "../ui/slider"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Switch } from "../ui/switch"
import { Input } from "../ui/input"
import {Filter, Search, Upload, X} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "../ui/dialog"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../ui/tabs";

interface SelectedImage {
  src: string;
  prompt: string;
  index: number;
}

interface Tag {
  text: string;
  color: string;
}

interface Tags {
  [key: number]: Tag[];
}

interface ImageModalProps {
  image: SelectedImage | null;
  onClose: () => void;
}

const DashboardImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [tags, setTags] = useState<Tags>({});
  const [newTag, setNewTag] = useState<string>('');
  const [tagColor, setTagColor] = useState<string>('#000000');
  const [activeTab, setActiveTab] = useState<string>("ai-generate");

  // Placeholder for generated images
  const generatedImages: string[] = [
    'https://placehold.co/400x400',
    'https://placehold.co/400x400',
    'https://placehold.co/400x400',
    'https://placehold.co/400x400',
    'https://placehold.co/400x400',
  ];

  const handleImageClick = (index: number): void => {
    setSelectedImage({
      src: generatedImages[index],
      prompt: "Previous prompt for this image", // Replace with actual previous prompt
      index
    });
  };

  const handleAddTag = (): void => {
    if (newTag && selectedImage) {
      setTags(prevTags => ({
        ...prevTags,
        [selectedImage.index]: [
          ...(prevTags[selectedImage.index] || []),
          { text: newTag, color: tagColor }
        ]
      }));
      setNewTag('');
    }
  };

  const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => (
    <Dialog open={!!image} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Full Size Image</DialogTitle>
          <DialogClose />
        </DialogHeader>
        {image && (
          <div className="mt-4 flex gap-2 text-white">
            <img src={image.src} alt="Full size" className="w-full h-auto" />
            <div className="mt-4 flex flex-col gap-2">
              <p className="mt-4 text-sm">Previous Prompt: {image.prompt}</p>
              <h4 className="font-semibold mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags[image.index]?.map((tag, idx) => (
                  <span key={idx} style={{ backgroundColor: tag.color }} className="px-2 py-1 rounded text-white">
                    {tag.text}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="New tag"
                  value={newTag}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
                  className="flex-grow"
                />
                <Input
                  type="color"
                  value={tagColor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagColor(e.target.value)}
                  className="w-12"
                />
                <Button onClick={handleAddTag}>Add Tag</Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
  const AIGenerateContent = () => (
    <>
      <div className="flex items-center space-x-4 mb-6 my-2">
        <Input
          type="text"
          placeholder="Enter your prompt here..."
          value={prompt}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value)}
          className="flex-grow bg-gray-800 text-white"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-gray-800 border-gray-700">
            {/* ... (filter content remains the same) ... */}
          </PopoverContent>
        </Popover>
        <Button>
          <Search className="h-4 w-4 mr-2" />
          Generate
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {generatedImages.map((src, index) => (
          <div key={index} className="relative">
            <img
              src={src}
              alt={`Generated image ${index + 1}`}
              className="w-full h-auto rounded-lg cursor-pointer"
              onClick={() => handleImageClick(index)}
            />
            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
              {tags[index]?.map((tag, idx) => (
                <span key={idx} style={{ backgroundColor: tag.color }} className="px-2 py-1 rounded text-white text-xs">
                  {tag.text}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const UploadContent = () => (
    <div className="mt-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">Drag and drop images here, or click to select files</p>
        <Input type="file" className="hidden" multiple accept="image/*" />
        <Button className="mt-4" onClick={() => {}}>
          Select Files
        </Button>
      </div>
    </div>
  );

  return (
    <div className="text-white p-6 rounded-lg">
      <div className="flex gap-2 items-center mb-4">
        <h1 className="text-4xl font-bold">Images</h1>
      </div>
      <p className="mb-4">Use images in your video process, either upload images here or generate them using AI. Be sure to tag images so you can easily find images later.</p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai-generate">AI Generate</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>
        <TabsContent value="ai-generate">
          <AIGenerateContent />
        </TabsContent>
        <TabsContent value="upload">
          <UploadContent />
        </TabsContent>
      </Tabs>

      <ImageModal
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
};

export default DashboardImageGenerator;
