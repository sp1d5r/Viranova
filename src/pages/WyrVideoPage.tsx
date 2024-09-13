import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { WyrVideo, OptionSet } from '../types/collections/Niche';
import FirebaseFirestoreService from '../services/database/strategies/FirebaseFirestoreService';
import { useNotification } from '../contexts/NotificationProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';
import { Plus, Trash2 } from 'lucide-react';
import ScrollableLayout from "../layouts/ScrollableLayout";

const WyrVideoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [wyrVideo, setWyrVideo] = useState<WyrVideo | null>(null);
  const [optionSets, setOptionSets] = useState<OptionSet[]>([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (id) {
      FirebaseFirestoreService.getDocument<WyrVideo>(
        'wyr-videos',
        id,
        (video) => {
          if (video) {
            setWyrVideo(video);
            setOptionSets(video.optionSets);
          }
        },
        (error) => {
          console.error(error);
          showNotification('Error', 'Failed to fetch WYR video', 'error');
        }
      );
    }
  }, [id]);

  const handleOptionSetChange = (index: number, field: keyof OptionSet, value: string | number) => {
    const updatedOptionSets = [...optionSets];
    updatedOptionSets[index] = { ...updatedOptionSets[index], [field]: value };
    setOptionSets(updatedOptionSets);
  };

  const addOptionSet = () => {
    setOptionSets([...optionSets, { transcript: '', option1: '', option2: '', option1_percentage: 50 }]);
  };

  const deleteOptionSet = (index: number) => {
    const updatedOptionSets = optionSets.filter((_, i) => i !== index);
    setOptionSets(updatedOptionSets);
  };

  const saveChanges = () => {
    if (wyrVideo && wyrVideo.id) {
      FirebaseFirestoreService.updateDocument(
        'wyr-videos',
        wyrVideo.id,
        { optionSets, updatedAt: new Date() },
        () => {
          showNotification('Success', 'Changes saved successfully', 'success');
        },
        (error) => {
          console.error(error);
          showNotification('Error', 'Failed to save changes', 'error');
        }
      );
    }
  };

  if (!wyrVideo) {
    return <div>Loading...</div>;
  }

  return (
    <ScrollableLayout>
      <div className="container text-white py-2">
        <h1 className="text-2xl font-bold mb-4">{wyrVideo.theme}</h1>
        <p className="text-gray-600 mb-6">{wyrVideo.explanation}</p>

        {optionSets.map((optionSet, index) => (
          <Card key={index} className="mb-6">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Option Set {index + 1}</span>
                <Button variant="ghost" size="icon" onClick={() => deleteOptionSet(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transcript</label>
                  <Input
                    value={optionSet.transcript}
                    onChange={(e) => handleOptionSetChange(index, 'transcript', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Option 1</label>
                  <Input
                    value={optionSet.option1}
                    onChange={(e) => handleOptionSetChange(index, 'option1', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Option 2</label>
                  <Input
                    value={optionSet.option2}
                    onChange={(e) => handleOptionSetChange(index, 'option2', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Option 1 Percentage: {optionSet.option1_percentage}%
                  </label>
                  <Slider
                    value={[optionSet.option1_percentage]}
                    onValueChange={(value) => handleOptionSetChange(index, 'option1_percentage', value[0])}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-between mt-6">
          <Button onClick={addOptionSet} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" /> Add Option Set
          </Button>
          <Button onClick={saveChanges}>Save Changes</Button>
        </div>
      </div>
    </ScrollableLayout>
  );
};

export default WyrVideoPage;