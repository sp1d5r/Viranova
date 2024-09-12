import React, { useState, useEffect } from 'react';
import { Slider } from "../ui/slider"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Switch } from "../ui/switch"
import { Input } from "../ui/input"
import {Filter, Loader, Search, Upload, X} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "../ui/dialog"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../ui/tabs";
import FirebaseDatabaseService from "../../services/database/strategies/FirebaseFirestoreService";
import {useNotification} from "../../contexts/NotificationProvider";
import {useAuth} from "../../contexts/Authentication";
import {EnhancedImage} from "../image-loader/ImageLoader";

interface Image {
  id: string;
  prompt: string;
  setup: string;
  num_generations: number;
  status: 'processing' | 'pending' | 'completed' | 'error'
  created_at: Date;
  image_paths?: string[];
  uid: string;
}

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
  const [setup, setSetup] = useState<string>('square');
  const [numGenerations, setNumGenerations] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const {showNotification} = useNotification();
  const {authState} = useAuth();
  const [userImages, setUserImages] = useState<Image[]>([]);

  useEffect(() => {
    if (authState.user) {
      fetchUserImages();
    }
  }, [authState.user]);

  const fetchUserImages = () => {
    if (authState.user) {
      FirebaseDatabaseService.queryDocuments<Image>(
        'images',
        'uid',
        authState.user.uid,
        'created_at',
        (images) => {
          setUserImages(images);
        },
        (error) => {
          console.error('Error fetching images:', error);
          showNotification('Error', 'Failed to fetch images', 'error');
        }
      );
    }
  };

  const handleGenerate = async () => {
    if (authState.user) {
      setIsGenerating(true);
      try {
        FirebaseDatabaseService.addDocument(
          'images',
          {
            prompt,
            setup,
            num_generations: numGenerations,
            status: 'pending',
            created_at: new Date(),
            uid: authState.user.uid
          },
          () => {
            // Reset form
            setPrompt('');
            setSetup('square');
            setNumGenerations(1);
            showNotification('Image Generation Requested', 'Successfully requested image generation', 'info');
            fetchUserImages(); // Refresh the image list
          },
          (error) => {
            showNotification('Image Generation Failed', error.message, 'error');
          }
        );
      } catch (error) {
        console.error('Error generating images:', error);
      } finally {
        setIsGenerating(false);
      }
    } else {
      showNotification('Image Generation Failed', 'Not authenticated yet.', 'error');
    }
  };

  const handleImageClick = (image: Image): void => {
    setSelectedImage({
      src: image.image_paths ? image.image_paths[0] : 'https://placehold.co/400x400',
      prompt: image.prompt,
      index: userImages.findIndex(img => img.id === image.id)
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
      <DialogContent className="w-full">
        <DialogHeader>
          <DialogTitle className="text-white">Full Size Image</DialogTitle>
          <DialogClose />
        </DialogHeader>
        {image && (
          <div className="mt-4 flex gap-2 text-white flex-wrap">
            <EnhancedImage
              src={image.src ? image.src : 'https://placehold.co/400x400'}
              className="h-auto"
              alt="Full size"
            />
            <div className="mt-4 flex flex-col gap-2">
              <p className="mt-4 text-sm">Prompt: {image.prompt}</p>
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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'pending':
        return 'bg-blue-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const StatusIndicator: React.FC<{ status: string }> = ({ status }) => (
    <div className={`absolute top-2 right-2 flex items-center ${getStatusColor(status)} text-white text-xs font-bold px-2 py-1 rounded-full`}>
      {status === 'processing' && <Loader className="animate-spin mr-1 h-3 w-3" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
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
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Image Size</h3>
                    <div className="flex space-x-2 mb-2">
                      <Button size="sm" variant={setup === 'portrait' ? 'default' : 'outline'} onClick={() => setSetup('portrait')}>Portrait</Button>
                      <Button size="sm" variant={setup === 'square' ? 'default' : 'outline'} onClick={() => setSetup('square')}>Square</Button>
                      <Button size="sm" variant={setup === 'landscape' ? 'default' : 'outline'} onClick={() => setSetup('landscape')}>Landscape</Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Number of Generations</h3>
                    <Input
                      type="number"
                      value={numGenerations}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNumGenerations(parseInt(e.target.value))}
                      min={1}
                      max={10}
                      className="w-full"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button onClick={handleGenerate} disabled={userImages.filter(image => image.status == "processing").length > 0}>
              <Search className="h-4 w-4 mr-2" />
              {userImages.filter(image => image.status == "processing").length > 0 ? 'Generating...' : 'Generate'}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {userImages.map((image, index) => (
              <div key={image.id} className="relative">
                {image.status === 'processing' || image.status === 'pending' ? (
                  <div className="w-full aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
                    <Loader className="animate-spin animate-bounce h-8 w-8 text-white" />
                  </div>
                ) : (
                  <EnhancedImage
                    src={image.image_paths ? image.image_paths[0] : 'https://placehold.co/400x400'}
                    alt={`Generated image ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg cursor-pointer"
                    onClick={() => handleImageClick(image)}
                  />
                )}
                <StatusIndicator status={image.status} />
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  {tags[index]?.map((tag, idx) => (
                    <span key={idx} style={{ backgroundColor: tag.color }} className="px-2 py-1 rounded text-white text-xs">
                {tag.text}
              </span>
                  ))}
                </div>
                <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 p-2 rounded">
                  <p className="text-xs truncate">{image.prompt}</p>
                </div>
              </div>
            ))}
          </div>
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