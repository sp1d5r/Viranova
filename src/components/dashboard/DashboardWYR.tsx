import React, { useState } from 'react';
import { Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {Niche, VideoIdea } from "../../types/collections/Niche";
import CreateNicheModal from "./WYR/CreateNicheModal";
import VideoIdeaCard from "./WYR/VideoIdeaCard";
import {Input} from "../ui/input";
import {Button} from "../ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../ui/select";


// Mock data
const initialNiches: Niche[] = [
  { id: '1', name: 'Fashion',  leftColor: '#4ade80', rightColor: '#6366f1', },
  { id: '2', name: 'Basketball',leftColor: '#fb923c', rightColor: '#a855f7'},
];

const initialVideoIdeas: VideoIdea[] = [
  {
    id: '1',
    title: 'Fashion Faux Pas Fix',
    explanation: 'Focuses on correcting fashion mistakes, e.g., "Fix a too-tight dress or a mismatched color outfit?"',
    nicheId: '1',
    totalViews: 500,
  },
  {
    id: '2',
    title: 'Decade Style Swap',
    explanation: 'Explores swapping styles from different decades, e.g., "1970s boho or 1990s grunge?"',
    nicheId: '1',
    totalViews: 300,
  },
  {
    id: '3',
    title: 'Runway Showdown',
    explanation: 'Presents choices between different runway looks, e.g., "Couture gown or avant-garde outfit?"',
    nicheId: '1',
    totalViews: 400,
  },
  {
    id: '4',
    title: 'Slam Dunk Challenge',
    explanation: 'Compares different basketball dunk styles, e.g., "360 windmill or between-the-legs dunk?"',
    nicheId: '2',
    totalViews: 600,
  },
];

// Components
const NicheButton: React.FC<{ niche: Niche; isSelected: boolean; onClick: () => void }> = ({ niche, isSelected, onClick }) => (
  <button
    className={`font-semibold py-2 px-4 rounded-full transition-all duration-200 ${
      isSelected
        ? `bg-gradient-to-r from-[${niche.leftColor}] to-[${niche.rightColor}] text-white`
        : `border-2 border-gray-300 text-gray-700 hover:border-gray-400`
    }`}
    style={{
      background: isSelected
        ? `linear-gradient(to right, ${niche.leftColor}, ${niche.rightColor})`
        : 'transparent',
    }}
    onClick={onClick}
  >
    {niche.name}
  </button>
);



const DashboardWYR: React.FC = () => {
  const [niches, setNiches] = useState(initialNiches);
  const [videoIdeas, setVideoIdeas] = useState(initialVideoIdeas);
  const [selectedNiche, setSelectedNiche] = useState<Niche | null>(null);
  const [newIdeaPrompt, setNewIdeaPrompt] = useState('');
  const [ideaCount, setIdeaCount] = useState('1');

  const handleNicheSelect = (niche: Niche) => {
    setSelectedNiche(selectedNiche?.id === niche.id ? null : niche);
  };

  const handleCreateNiche = (newNiche: Niche) => {
    setNiches([...niches, newNiche]);
  };

  const handleGenerateIdeas = () => {
    if (selectedNiche) {
      const count = parseInt(ideaCount);
      const newIdeas: VideoIdea[] = Array.from({ length: count }, (_, index) => ({
        id: String(videoIdeas.length + index + 1),
        title: `New Idea ${index + 1} for ${selectedNiche.name}`,
        explanation: newIdeaPrompt || `Generated based on ${selectedNiche.name}`,
        nicheId: selectedNiche.id,
        totalViews: 0,
      }));
      setVideoIdeas([...videoIdeas, ...newIdeas]);
      setNewIdeaPrompt('');
    }
  };

  const filteredVideoIdeas = selectedNiche
    ? videoIdeas.filter((idea) => idea.nicheId === selectedNiche.id)
    : videoIdeas;
  return (
    <div className="p-4 md:p-8 max-w-[100vw]">
      <Alert className="my-2">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Feature in Beta</AlertTitle>
        <AlertDescription>
          This feature is currently under development, this type of content has been quite popular recently so will try and push this out immediately.
        </AlertDescription>
      </Alert>
      <h1 className="text-2xl font-bold mb-4">Would You Rather</h1>
      <p className="mb-4">A new popular format for TikTok videos used to drive engagement. Pick a Niche and then create videos around that niche.</p>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Niche</h2>
        <div className="flex space-x-2">
          <CreateNicheModal onCreateNiche={handleCreateNiche} />
          {niches.map((niche) => (
            <NicheButton
              key={niche.id}
              niche={niche}
              isSelected={selectedNiche?.id === niche.id}
              onClick={() => handleNicheSelect(niche)}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Video Ideas</h2>
        {selectedNiche && (
          <div className="flex space-x-2 mb-4">
            <Input
              type="text"
              placeholder="Enter prompt for new idea (optional)"
              value={newIdeaPrompt}
              onChange={(e) => setNewIdeaPrompt(e.target.value)}
              className="flex-grow"
            />
            <Select value={ideaCount} onValueChange={setIdeaCount}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="# of ideas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 idea</SelectItem>
                <SelectItem value="3">3 ideas</SelectItem>
                <SelectItem value="5">5 ideas</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGenerateIdeas}>Generate Ideas</Button>
          </div>
        )}
        {selectedNiche && filteredVideoIdeas.map((idea) => (
          <VideoIdeaCard key={idea.id} videoIdea={idea} niche={selectedNiche} />
        ))}
    </div>
  </div>
  );
};

export default DashboardWYR;