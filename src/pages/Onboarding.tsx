import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/Authentication";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { useToast } from "../components/ui/use-toast";
import FirebaseFirestoreService from "../services/database/strategies/FirebaseFirestoreService";
import {BackgroundBeams} from "../components/ui/background-beams";
import {Home, LineChart, Smartphone, Tv, Video, X} from 'lucide-react';
import AnalyticsGif from '../assets/gifs/Analytics.gif';
import ChannelTracking from '../assets/gifs/Channel Tracking.gif';
import ShortIdeas from '../assets/gifs/Short Ideas.gif';
import ShortManagement from '../assets/gifs/Short Management.gif';
import VideoManagement from '../assets/gifs/Video Management.gif';
import {User} from "../types/User";
import {ChannelsTracking} from "../types/collections/Channels";

export interface OnboardingProps {}

export const Onboarding: React.FC<OnboardingProps> = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    company: '',
    heardFrom: '',
    channelName: '',
    tiktokLink: '',
    primaryColor: '',
    secondaryColor: '',
    brandTheme: [] as string[],
    clippingFor: 'self',
  });
  const [currentThemeWord, setCurrentThemeWord] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleAddThemeWord = () => {
    if (currentThemeWord.trim() !== '' && !formData.brandTheme.includes(currentThemeWord.trim())) {
      setFormData({
        ...formData,
        brandTheme: [...formData.brandTheme, currentThemeWord.trim()]
      });
      setCurrentThemeWord('');
    }
  };

  const handleRemoveThemeWord = (word: string) => {
    setFormData({
      ...formData,
      brandTheme: formData.brandTheme.filter(w => w !== word)
    });
  };

  useEffect(() => {
    if (authState.user) {
      // Get channels
      FirebaseFirestoreService.getDocument<User>(
        "users",
        authState.user.uid,
        (doc) => {
          if (doc) {
            navigate('/dashboard')
          } else {
          }
        },
        (error) => {
        }
      );
    }
  }, [authState])

  const handleSubmit = async () => {
    if (!authState.user?.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to complete onboarding.",
        variant: "destructive",
      });
      return;
    }

    try {
      await FirebaseFirestoreService.updateDocument(
        "users",
        authState.user.uid,
        { ...formData, uid: authState.user.uid },
        () => {
          toast({
            title: "Success",
            description: "Your profile has been created successfully!",
          });
          navigate('/dashboard');
        },
        (error) => {
          toast({
            title: "Error",
            description: "Failed to create profile. Please try again.",
            variant: "destructive",
          });
          console.error("Error creating user document:", error);
        }
      );
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  const platformInfo = [
    {
      title: "Channel Tracking",
      description: "Track your YouTube channels in the Channels tab",
      gifSrc: ChannelTracking
    },
    {
      title: "Automatic Video Downloads",
      description: "Videos are automatically downloaded with email notifications",
      gifSrc: ShortIdeas
    },
    {
      title: "Video Management",
      description: "Find downloaded videos in the Videos tab",
      gifSrc:VideoManagement
    },
    {
      title: "Short Ideas",
      description: "Get recommended short ideas for each video",
      gifSrc: ShortIdeas
    },
    {
      title: "Automatic Short Creation",
      description: "Use Autogenerate to create shorts automatically",
      gifSrc: ShortIdeas
    },
    {
      title: "Short Management",
      description: "Manage and edit shorts in the Shorts tab",
      gifSrc: ShortManagement
    },
    {
      title: "Analytics Tracking",
      description: "Link TikTok videos to enable analytics tracking",
      gifSrc: AnalyticsGif
    }
  ];

  const renderPlatformInfoStep = (index: number) => (
    <CardContent className="flex flex-col items-center">
      <h3 className="text-xl font-semibold mb-4">{platformInfo[index].title}</h3>
      <div className="w-full h-64 mb-4 bg-gray-200 rounded-lg overflow-hidden">
        <img
          src={platformInfo[index].gifSrc}
          alt={platformInfo[index].title}
          className="w-full h-full object-cover"
        />
      </div>
      <p className="text-center">{platformInfo[index].description}</p>
    </CardContent>
  );

  const totalSteps = 2 + platformInfo.length;

  const renderStep1 = () => (
    <CardContent>
      <div className="grid w-full items-center gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="age">Age</Label>
          <Input id="age" name="age" type="number" value={formData.age} onChange={handleInputChange} />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" value={formData.company} onChange={handleInputChange} />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="heardFrom">Where did you hear about us?</Label>
          <Select onValueChange={handleSelectChange('heardFrom')}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="social">Social Media</SelectItem>
              <SelectItem value="friend">Friend</SelectItem>
              <SelectItem value="ad">Advertisement</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardContent>
  );

  const renderStep2 = () => (
    <CardContent>
      <div className="grid w-full items-center gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="channelName">Channel Name</Label>
          <Input id="channelName" name="channelName" value={formData.channelName} onChange={handleInputChange} />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="tiktokLink">TikTok Link (if exists)</Label>
          <Input id="tiktokLink" name="tiktokLink" value={formData.tiktokLink} onChange={handleInputChange} />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="primaryColor">Primary Color</Label>
          <Input id="primaryColor" name="primaryColor" type="color" value={formData.primaryColor} onChange={handleInputChange} />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="secondaryColor">Secondary Color</Label>
          <Input id="secondaryColor" name="secondaryColor" type="color" value={formData.secondaryColor} onChange={handleInputChange} />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="brandTheme">Brand Theme Words</Label>
          <div className="flex space-x-2">
            <Input
              id="brandTheme"
              value={currentThemeWord}
              onChange={(e) => setCurrentThemeWord(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddThemeWord();
                }
              }}
              placeholder="Enter a theme word"
            />
            <Button onClick={handleAddThemeWord} type="button">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.brandTheme.map((word, index) => (
              <Badge key={index} variant="secondary" className="px-2 py-1">
                {word}
                <button
                  onClick={() => handleRemoveThemeWord(word)}
                  className="ml-2 text-xs"
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label>Are you clipping your own content or for someone else?</Label>
          <RadioGroup defaultValue="self" onValueChange={handleSelectChange('clippingFor')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="self" id="self" />
              <Label htmlFor="self">My own content</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">For someone else</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </CardContent>
  );

  const renderStep3 = () => (
    <CardContent>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Platform Information</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Track your YouTube channels in the Channels tab</li>
          <li>Videos are automatically downloaded with email notifications</li>
          <li>Find downloaded videos in the Videos tab</li>
          <li>Get recommended short ideas for each video</li>
          <li>Use Autogenerate to create shorts automatically</li>
          <li>Manage and edit shorts in the Shorts tab</li>
          <li>Link TikTok videos to enable analytics tracking</li>
        </ul>
      </div>
    </CardContent>
  );

  const renderStep = () => {
    if (step === 1) return renderStep1();
    if (step === 2) return renderStep2();
    if (step > 2 && step <= totalSteps) return renderPlatformInfoStep(step - 3);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-900 to-indigo-900">
      <Card className="z-10 w-[350px] md:w-[450px] lg:w-[600px]">
        <CardHeader>
          <CardTitle>Welcome to Vira<span className="text-primary">Nova</span></CardTitle>
          <CardDescription>
            {step <= 2 ? "Let's get you set up in just a few steps" : "Let's explore what ViraNova can do for you"}
          </CardDescription>
        </CardHeader>
        {renderStep()}
        <CardFooter className="flex justify-between">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Previous
            </Button>
          )}
          {step < totalSteps ? (
            <Button onClick={() => setStep(step + 1)}>Next</Button>
          ) : (
            <Button onClick={handleSubmit}>Finish</Button>
          )}
        </CardFooter>
      </Card>
      <BackgroundBeams />
    </div>
  );
};