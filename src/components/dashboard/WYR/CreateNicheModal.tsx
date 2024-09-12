import React, {useRef, useState} from "react";
import {Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "../../ui/dialog";
import { PlusCircle } from "lucide-react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Niche } from "../../../types/collections/Niche";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";

const tailwindColors = {
  slate: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a'],
  gray: ['#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827'],
  zinc: ['#fafafa', '#f4f4f5', '#e4e4e7', '#d4d4d8', '#a1a1aa', '#71717a', '#52525b', '#3f3f46', '#27272a', '#18181b'],
  neutral: ['#fafafa', '#f5f5f5', '#e5e5e5', '#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040', '#262626', '#171717'],
  stone: ['#fafaf9', '#f5f5f4', '#e7e5e4', '#d6d3d1', '#a8a29e', '#78716c', '#57534e', '#44403c', '#292524', '#1c1917'],
  red: ['#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'],
  orange: ['#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12'],
  amber: ['#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'],
  yellow: ['#fefce8', '#fef9c3', '#fef08a', '#fde047', '#facc15', '#eab308', '#ca8a04', '#a16207', '#854d0e', '#713f12'],
  lime: ['#f7fee7', '#ecfccb', '#d9f99d', '#bef264', '#a3e635', '#84cc16', '#65a30d', '#4d7c0f', '#3f6212', '#365314'],
  green: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'],
  emerald: ['#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b'],
  teal: ['#f0fdfa', '#ccfbf1', '#99f6e4', '#5eead4', '#2dd4bf', '#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a'],
  cyan: ['#ecfeff', '#cffafe', '#a5f3fc', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'],
  sky: ['#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'],
  blue: ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
  indigo: ['#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81'],
  violet: ['#f5f3ff', '#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'],
  purple: ['#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce', '#6b21a8', '#581c87'],
  fuchsia: ['#fdf4ff', '#fae8ff', '#f5d0fe', '#f0abfc', '#e879f9', '#d946ef', '#c026d3', '#a21caf', '#86198f', '#701a75'],
  pink: ['#fdf2f8', '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d', '#831843'],
  rose: ['#fff1f2', '#ffe4e6', '#fecdd3', '#fda4af', '#fb7185', '#f43f5e', '#e11d48', '#be123c', '#9f1239', '#881337'],
};

const ColorPicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <div className="flex items-center space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[120px] h-[36px] p-0 border-2"
              style={{ backgroundColor: value }}
            >
              <span className="sr-only">Pick a color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Color</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pick a color for the {label.toLowerCase()}
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-10 gap-2">
                  {Object.values(tailwindColors).flatMap(colorSet => colorSet[5]).map((color) => (
                    <Button
                      key={color}
                      variant="outline"
                      className="w-6 h-6 p-0 border-2"
                      style={{ backgroundColor: color }}
                      onClick={() => onChange(color)}
                    >
                      <span className="sr-only">{color}</span>
                    </Button>
                  ))}
                </div>
                <Input
                  type="color"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-[100px]"
        />
      </div>
    </div>
  );
};

const CreateNicheModal: React.FC<{ onCreateNiche: (niche: Niche) => void }> = ({ onCreateNiche }) => {
  const [newNiche, setNewNiche] = useState({ name: '', leftColor: '#3b82f6', rightColor: '#22c55e' });
  const closeRef = useRef<HTMLButtonElement>(null);

  const handleCreate = () => {
    if (newNiche.name && newNiche.leftColor && newNiche.rightColor) {
      onCreateNiche({ ...newNiche, id: Date.now().toString() });
      setNewNiche({ name: '', leftColor: newNiche.leftColor, rightColor: newNiche.rightColor });
      closeRef.current?.click(); // Programmatically close the dialog
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="border border-gray-300 rounded-full p-2 hover:bg-white/20">
          <PlusCircle className="h-6 w-6" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Create New Niche</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Niche Name"
            value={newNiche.name}
            onChange={(e) => setNewNiche({ ...newNiche, name: e.target.value })}
            className="bg-gray-700 text-white"
          />
          <ColorPicker
            label="Left Color"
            value={newNiche.leftColor}
            onChange={(color) => setNewNiche({ ...newNiche, leftColor: color })}
          />
          <ColorPicker
            label="Right Color"
            value={newNiche.rightColor}
            onChange={(color) => setNewNiche({ ...newNiche, rightColor: color })}
          />
          <Button onClick={handleCreate}>Create Niche</Button>
        </div>
        <DialogClose ref={closeRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};

export default CreateNicheModal;