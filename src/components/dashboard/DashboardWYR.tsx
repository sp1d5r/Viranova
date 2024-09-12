import React, {useEffect, useState} from 'react';
import { Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {Niche, VideoIdea } from "../../types/collections/Niche";
import CreateNicheModal from "./WYR/CreateNicheModal";
import VideoIdeaCard from "./WYR/VideoIdeaCard";
import {Input} from "../ui/input";
import {Button} from "../ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../ui/select";
import FirebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import {useAuth} from "../../contexts/Authentication";
import {useNotification} from "../../contexts/NotificationProvider";
import {useWouldYouRatherRequestManagement} from "../../contexts/WYRRequestProvider";

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
  const [niches, setNiches] = useState<Niche[]>([]);
  const [videoIdeas, setVideoIdeas] = useState<VideoIdea[]>([]);
  const [selectedNiche, setSelectedNiche] = useState<Niche | null>(null);
  const [newIdeaPrompt, setNewIdeaPrompt] = useState('');
  const [ideaCount, setIdeaCount] = useState('1');
  const {authState} = useAuth();
  const {showNotification} = useNotification();
  const { createWouldYouRatherRequest, getWouldYouRatherRequests, getUserWouldYouRatherRequests } = useWouldYouRatherRequestManagement();

  useEffect(() => {
    if (authState.user){
      FirebaseFirestoreService.listenToQuery<Niche>(
        'niches',
        'uid',
        authState.user.uid,
        "createdAt",
        (collectedNiches) => {
          console.log(collectedNiches)
          if (collectedNiches) {
            setNiches(collectedNiches);
          }
        },
        (error) => {
          console.log(error);
          showNotification('Failed', 'Unable to collect niches', 'error');
        }
      )
    }
  }, [authState.user])

  useEffect(() => {
    if (selectedNiche && selectedNiche.id) {
      FirebaseFirestoreService.listenToQuery<VideoIdea>(
        'wyr-themes',
        'nicheId',
        selectedNiche.id,
        "createdAt",
        (collectedVideoIdeas) => {
          console.log(collectedVideoIdeas)
          if (collectedVideoIdeas) {
            setVideoIdeas(collectedVideoIdeas);
          }
        },
        (error) => {
          console.log(error);
          showNotification('Failed', 'Unable to collect niches', 'error');
        }
      )
    }
  }, [selectedNiche]);

  const handleNicheSelect = (niche: Niche) => {
    setSelectedNiche(selectedNiche?.id === niche.id ? null : niche);
  };

  const handleCreateNiche = (newNiche: Niche) => {
    if (authState.user) {
      FirebaseFirestoreService.addDocument(
        'niches',
        {
          ...newNiche,
        }
      )
    }
    setNiches([...niches, newNiche]);
  };

  const handleGenerateIdeas = () => {
    if (selectedNiche && selectedNiche.id) {
      const count = parseInt(ideaCount);

      FirebaseFirestoreService.updateDocument<Niche>(
        "niches",
        selectedNiche.id,
        {
          prompt: newIdeaPrompt,
          numberOfIdeas: count,
          status: 'pending',
        }
      )

      createWouldYouRatherRequest(
        selectedNiche.id,
        'v1/generate-video-ideas',
        0,
        () => {
          showNotification('Requested Idea Generation', 'Successfully requested generations', 'info')
        }
      )
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