import React, {useEffect, useState} from 'react';
import { TrackItem } from '../../../../types/collections/Shorts';
import { Trash2, UploadIcon, AlignCenterHorizontalIcon, AlignCenterVerticalIcon } from 'lucide-react';
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { Button } from "../../../ui/button";
import { Slider } from "../../../ui/slider";
import FirebaseStorageService from "../../../../services/storage/strategies/FirebaseStorageService";

interface ItemEditorProps {
  selectedItem: TrackItem | null;
  onItemUpdate: (updatedItem: TrackItem) => void;
  onItemDelete: (itemId: string) => void;
  shortId: string;
}

const ItemEditor: React.FC<ItemEditorProps> = ({ selectedItem, onItemUpdate, onItemDelete, shortId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    console.log(selectedItem)
  }, [selectedItem]);

  if (!selectedItem) {
    return (
      <div className="flex-1 h-full min-h-[300px] bg-background p-4 rounded-lg border">
        <p className="text-muted-foreground">Select an item to edit</p>
      </div>
    );
  }

  const handleChange = (prop: string, value: number | string) => {
    onItemUpdate({
      ...selectedItem,
      objectMetadata: { ...selectedItem.objectMetadata, [prop]: value }
    });
  };

  const handleDelete = () => {
    onItemDelete(selectedItem.id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAlignCenter = (axis: 'x' | 'y') => {
    const { width, height } = selectedItem.objectMetadata;
    let newValue;
    if (axis === 'x') {
      newValue = Math.round((1080 - width) / 2);
    } else {
      newValue = Math.round((1920 - height) / 2);
    }
    handleChange(axis, newValue);
  };

  const handleFileUpload = async () => {
    if (!file) return;

    const filePath = `shorts/${shortId}/assets/${file.name}`;

    try {
      const downloadURL = await FirebaseStorageService.uploadFile(filePath, file, (progress) => {
        setUploadProgress(progress);
      });
      onItemUpdate({
        ...selectedItem,
        objectMetadata: {
          ...selectedItem.objectMetadata,
          src: downloadURL,
          uploadType: 'upload'
        }
      });
      setFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error("Error uploading file:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  const handleRemoveUpload = async () => {
    if (selectedItem && selectedItem.objectMetadata && selectedItem.objectMetadata.uploadType == "upload") {
      await FirebaseStorageService.deleteFile(selectedItem.objectMetadata.src);
      handleChange('src', '');
      handleChange('uploadType', 'link');
    }
  };

  return (
    <div className="flex-1 h-full max-w-[400px] min-h-[300px] bg-background p-4 rounded-lg text-gray-200">
      <form className="grid w-full items-start gap-3" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="grid gap-3 rounded-lg border p-4 border-gray-500">
          <legend className="px-1 text-sm font-medium text-white">Item Settings</legend>
          <div className="grid gap-1">
            <Label htmlFor="type">Type</Label>
            <Select
              value={selectedItem.objectMetadata.type}
              onValueChange={(value) => handleChange('type', value)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select item type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {['x', 'y', 'width', 'height'].map((prop) => (
            <div key={prop} className="grid gap-1">
              <Label htmlFor={prop}>{prop.charAt(0).toUpperCase() + prop.slice(1)}</Label>
              <div className="flex items-center gap-2">
                <Slider
                  id={prop}
                  min={0}
                  max={prop === 'y' || prop === 'height' ? 1920 : 1080}
                  step={1}
                  value={[selectedItem.objectMetadata[prop as keyof typeof selectedItem.objectMetadata] as number]}
                  onValueChange={(value) => handleChange(prop, value[0])}
                  className="flex-grow"
                />
                <Input
                  type="number"
                  value={selectedItem.objectMetadata[prop as keyof typeof selectedItem.objectMetadata]}
                  onChange={(e) => handleChange(prop, Number(e.target.value))}
                  className="w-20"
                />
                {(prop === 'x' || prop === 'y') && (
                  <Button
                    size="icon"
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault()
                      handleAlignCenter(prop as 'x' | 'y')
                    }}
                    title={`Align ${prop.toUpperCase()} Center`}
                  >
                    {prop === 'x' ? <AlignCenterVerticalIcon size={16} /> : <AlignCenterHorizontalIcon size={16} />}
                  </Button>
                )}
              </div>
            </div>
          ))}
          <div className="grid gap-3">
            <Label htmlFor="src">Source</Label>
            {selectedItem.objectMetadata.uploadType === 'link' && (
              <div className="flex gap-2 justify-center items-center">
                <Input
                  id="src"
                  type="text"
                  value={selectedItem.objectMetadata.src}
                  onChange={(e) => handleChange('src', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="fileInput"
                />
                <Button type="button" size="icon" variant="outline" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('fileInput')?.click()
                }}>
                  <UploadIcon />
                </Button>
              </div>
            )}
            {selectedItem.objectMetadata.uploadType === 'upload' && (
              <div className="flex gap-2 justify-center items-center">
                <p className="flex-1 truncate">{selectedItem.objectMetadata.src}</p>
                <Button type="button" size="icon" variant="destructive" onClick={(e) => {
                  e.preventDefault();
                  handleRemoveUpload();
                }}>
                  <Trash2 />
                </Button>
              </div>
            )}
            {file && (
              <div className="mt-2 w-full max-w-[300px]">
                <p className="text-wrap max-w-[300px]">File uploaded!</p>
                <Button type="button" onClick={(e) => {
                      e.preventDefault();
                      handleFileUpload();
                    }
                  } disabled={uploadProgress > 0 && uploadProgress < 100}>
                  {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Upload'}
                </Button>
              </div>
            )}
          </div>
          {selectedItem.objectMetadata.type === 'video' && (
            <div className="grid gap-3">
              <Label htmlFor="offset">Offset (seconds)</Label>
              <Input
                id="offset"
                type="number"
                value={selectedItem.objectMetadata.offset}
                onChange={(e) => handleChange('offset', Number(e.target.value))}
              />
            </div>
          )}
        </fieldset>
      </form>
      <div className="mt-6">
        <Button
          onClick={handleDelete}
          variant="destructive"
          className="w-full"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Item
        </Button>
      </div>
    </div>
  );
};

export default ItemEditor;