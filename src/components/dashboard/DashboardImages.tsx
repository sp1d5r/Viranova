import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Loader, Plus, Upload, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "../ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import FirebaseDatabaseService from "../../services/database/strategies/FirebaseFirestoreService";
import { useNotification } from "../../contexts/NotificationProvider";
import { useAuth } from "../../contexts/Authentication";
import { EnhancedImage } from "../image-loader/ImageLoader";

interface Image {
  id: string;
  name: string;
  type: 'uploaded' | 'ai-generated';
  status: 'processing' | 'completed' | 'error';
  url: string;
  folder_id?: string;
  created_at: Date;
  uid: string;
}

interface Folder {
  id: string;
  name: string;
  created_at: Date;
  uid: string;
}

const DashboardImages: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("folders");
  const [folders, setFolders] = useState<Folder[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const { showNotification } = useNotification();
  const { authState } = useAuth();

  useEffect(() => {
    if (authState.user) {
      fetchFolders();
      fetchImages();
    }
  }, [authState.user]);

  const fetchFolders = () => {
    if (authState.user) {
      FirebaseDatabaseService.queryDocuments<Folder>(
        'folders',
        'uid',
        authState.user.uid,
        'created_at',
        (fetchedFolders) => {
          setFolders(fetchedFolders);
        },
        (error) => {
          console.error('Error fetching folders:', error);
          showNotification('Error', 'Failed to fetch folders', 'error');
        }
      );
    }
  };

  const fetchImages = () => {
    if (authState.user) {
      FirebaseDatabaseService.queryDocuments<Image>(
        'images',
        'uid',
        authState.user.uid,
        'created_at',
        (fetchedImages) => {
          setImages(fetchedImages);
        },
        (error) => {
          console.error('Error fetching images:', error);
          showNotification('Error', 'Failed to fetch images', 'error');
        }
      );
    }
  };

  const handleCreateFolder = () => {
    if (authState.user && newFolderName.trim()) {
      FirebaseDatabaseService.addDocument(
        'folders',
        {
          name: newFolderName.trim(),
          created_at: new Date(),
          uid: authState.user.uid
        },
        () => {
          showNotification('Folder Created', 'Successfully created new folder', 'success');
          setNewFolderName('');
          setIsCreatingFolder(false);
          fetchFolders();
        },
        (error) => {
          showNotification('Folder Creation Failed', error.message, 'error');
        }
      );
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setUploadedFiles(Array.from(event.target.files));
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      setUploadedFiles(Array.from(event.dataTransfer.files));
    }
  }, []);

  const handleUpload = async () => {
    if (authState.user && uploadedFiles.length > 0) {
      try {
        for (const file of uploadedFiles) {
          // Here you would typically upload the file to your storage service
          // For this example, we'll just add a record to Firestore
          await FirebaseDatabaseService.addDocument(
            'images',
            {
              name: file.name,
              type: 'uploaded',
              status: 'completed',
              url: `https://example.com/uploads/${file.name}`, // Simulated upload URL
              created_at: new Date(),
              uid: authState.user.uid
            },
            () => {
              showNotification('Image Uploaded', `Successfully uploaded ${file.name}`, 'success');
            },
            (error) => {
              showNotification('Upload Failed', error.message, 'error');
            }
          );
        }
        fetchImages();
        setUploadedFiles([]);
      } catch (error) {
        console.error('Error uploading images:', error);
      }
    } else {
      showNotification('Upload Failed', 'Not authenticated or no files selected.', 'error');
    }
  };

  const handleGenerate = async () => {
    if (authState.user && prompt.trim()) {
      setIsGenerating(true);
      try {
        await FirebaseDatabaseService.addDocument(
          'images',
          {
            name: prompt.trim(),
            type: 'ai-generated',
            status: 'processing',
            url: '',
            created_at: new Date(),
            uid: authState.user.uid
          },
          () => {
            showNotification('Image Generation Requested', 'Successfully requested image generation', 'info');
            setPrompt('');
            fetchImages();
          },
          (error) => {
            showNotification('Image Generation Failed', error.message, 'error');
          }
        );
      } catch (error) {
        console.error('Error generating image:', error);
      } finally {
        setIsGenerating(false);
      }
    } else {
      showNotification('Image Generation Failed', 'Not authenticated or no prompt provided.', 'error');
    }
  };

  const FolderGrid: React.FC = () => (
    <div className="grid grid-cols-4 gap-4">
      <div 
        className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-700"
        onClick={() => setIsCreatingFolder(true)}
      >
        <Plus className="h-12 w-12 text-white" />
      </div>
      {folders.map((folder) => (
        <div key={folder.id} className="aspect-square bg-gray-800 rounded-lg p-4 flex flex-col justify-between">
          <h3 className="text-lg font-semibold">{folder.name}</h3>
          <p className="text-sm text-gray-400">{new Date(folder.created_at).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );

  const UploadContent: React.FC = () => (
    <div className="mt-4">
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">Drag and drop images here, or click to select files</p>
        <Input 
          type="file" 
          className="hidden" 
          multiple 
          accept="image/*" 
          onChange={handleFileChange}
          id="file-upload"
        />
        <Button className="mt-4" onClick={() => document.getElementById('file-upload')?.click()}>
          Select Files
        </Button>
      </div>
      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Selected Files:</h3>
          <ul className="list-disc pl-5">
            {uploadedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
          <Button className="mt-4" onClick={handleUpload}>
            Upload Files
          </Button>
        </div>
      )}
    </div>
  );

  const AIGenerateContent: React.FC = () => (
    <div className="mt-4">
      <div className="flex items-center space-x-4 mb-6">
        <Input
          type="text"
          placeholder="Enter your prompt here..."
          value={prompt}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value)}
          className="flex-grow bg-gray-800 text-white"
        />
        <Button onClick={handleGenerate} disabled={isGenerating}>
          <Search className="h-4 w-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate'}
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {images.filter(img => img.type === 'ai-generated').map((image) => (
          <div key={image.id} className="aspect-square bg-gray-800 rounded-lg relative">
            {image.status === 'processing' ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader className="animate-spin h-8 w-8 text-white" />
              </div>
            ) : (
              <EnhancedImage
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover rounded-lg"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
              <p className="text-sm truncate">{image.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="text-white p-6 rounded-lg">
      <h1 className="text-4xl font-bold mb-4">Images</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="folders">Image Folders</TabsTrigger>
          <TabsTrigger value="upload">Upload Images</TabsTrigger>
          <TabsTrigger value="ai-generate">AI Generated Images</TabsTrigger>
        </TabsList>
        <TabsContent value="folders">
          <FolderGrid />
        </TabsContent>
        <TabsContent value="upload">
          <UploadContent />
        </TabsContent>
        <TabsContent value="ai-generate">
          <AIGenerateContent />
        </TabsContent>
      </Tabs>

      <Dialog open={isCreatingFolder} onOpenChange={setIsCreatingFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Enter folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <Button onClick={handleCreateFolder}>Create</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardImages;