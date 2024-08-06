import React from 'react';
import { TrackItem } from './types';
import {Trash2, UploadIcon} from 'lucide-react';
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
import {Slider} from "../../../ui/slider";

interface ItemEditorProps {
  selectedItem: TrackItem | null;
  onItemUpdate: (updatedItem: TrackItem) => void;
  onItemDelete: (itemId: string) => void;
}

const ItemEditor: React.FC<ItemEditorProps> = ({ selectedItem, onItemUpdate, onItemDelete }) => {
  if (!selectedItem) {
    return (
      <div className="flex-1 h-full bg-background p-4 rounded-lg border">
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

  return (
    <div className="flex-1 h-full bg-background p-4 rounded-lg text-gray-200">
      <form className="grid w-full items-start gap-3">
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
              </div>
            </div>
          ))}
          <div className="grid gap-3">
            <Label htmlFor="src">Source</Label>
            <div className="flex gap-2 justify-center items-center">
              <Input
                id="src"
                type="text"
                value={selectedItem.objectMetadata.src}
                onChange={(e) => handleChange('src', e.target.value)}
                className="flex-1"
              />
              <Button size={"icon"} variant={"outline"}>
                <UploadIcon />
              </Button>
            </div>
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