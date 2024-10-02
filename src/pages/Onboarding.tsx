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
import { X, CheckIcon} from 'lucide-react';
import AnalyticsGif from '../assets/gifs/Analytics.gif';
import ChannelTracking from '../assets/gifs/Channel Tracking.gif';
import ShortIdeas from '../assets/gifs/Short Ideas.gif';
import ShortManagement from '../assets/gifs/Short Management.gif';
import VideoManagement from '../assets/gifs/Video Management.gif';
import {User} from "../types/User";
import { SUBSCRIPTION_TIERS, SubscriptionTier, getSubscriptionDetails } from "../types/collections/User";
import StripePaymentService from "../services/payments/strategies/StripePaymentService";
import { RefundPolicy } from '../components/onboarding/RefundPolicy';
import { Checkbox } from '../components/ui/checkbox';


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
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('basic');
  const [currentThemeWord, setCurrentThemeWord] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [refundPolicyAcknowledged, setRefundPolicyAcknowledged] = useState(false);
  const [isRefundPolicyOpen, setIsRefundPolicyOpen] = useState(false);


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

  const handleDiscountCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDiscountCode(e.target.value);
  };

  const applyDiscountCode = async () => {
    if (discountCode === 'JHDNCKAJNDCKJCEOJEQOFPORKWE' || discountCode === 'SC0RPCODMTEAMCODE') {
      setIsDiscountApplied(true);
      toast({
        title: "Success",
        description: "Discount code applied successfully!",
        variant: "default",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid discount code.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveThemeWord = (word: string) => {
    setFormData({
      ...formData,
      brandTheme: formData.brandTheme.filter(w => w !== word)
    });
  };

  useEffect(() => {
    if (authState.isAuthenticated) {
      // Get channels
      FirebaseFirestoreService.getDocument<User>(
        "users",
        authState.user!.uid,
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
    if (!authState.user?.uid || !authState.user?.email) {
      toast({
        title: "Error",
        description: "You must be logged in with a valid email to complete onboarding.",
        variant: "destructive",
      });
      return;
    }

    if (!refundPolicyAcknowledged) {
      toast({
        title: "Error",
        description: "Please acknowledge the refund policy before subscribing.",
        variant: "destructive",
      });
      return;
    }

    try {
      const tierDetails = getSubscriptionDetails(selectedTier);

      // If discount is applied, skip payment process
      if (isDiscountApplied) {
        await FirebaseFirestoreService.updateDocument(
          "users",
          authState.user.uid,
          {
            ...formData,
            subscription: {
              status: 'active',
              tier: selectedTier,
              startDate: new Date(),
              endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Set end date to 1 year from now
              lastPaymentDate: new Date(),
              stripeSubscriptionId: 'COMP_' + authState.user.uid, // Use a prefix to indicate it's a complimentary subscription
            },
            credits: {
              current: tierDetails.credits,
              monthlyAllocation: tierDetails.credits,
            },
          },
          () => {
            navigate('/dashboard');
          },
          (error) => {
            toast({
              title: "Error",
              description: "Failed to update user data. Please try again.",
              variant: "destructive",
            });
            console.error("Error updating user document:", error);
          }
        );
      } else {
        const tierDetails = getSubscriptionDetails(selectedTier);

        // Step 1: Create Stripe customer
        await StripePaymentService.createCustomer(
          { email: authState.user.email },
          async (customerId) => {
            // Step 2: Store form data and initial subscription info in Firestore
            await FirebaseFirestoreService.updateDocument(
              "users",
              authState.user!.uid,
              {
                ...formData,
                stripeCustomerId: customerId,
                selectedTier: selectedTier,
                paymentPending: true,
              },
              async () => {
                // Step 3: Create a Checkout Session
                await StripePaymentService.createCheckoutSession(
                  tierDetails.stripePriceId,
                  customerId,
                  `${window.location.origin}/onboarding-success?userId=${authState.user!.uid}`, // Pass userId in URL
                  `${window.location.origin}/onboarding-cancel?userId=${authState.user!.uid}`,
                  (sessionUrl) => {
                    // Redirect to Stripe Checkout
                    window.location.href = sessionUrl;
                  },
                  (error) => {
                    toast({
                      title: "Error",
                      description: "Failed to start checkout process. Please try again.",
                      variant: "destructive",
                    });
                    console.error("Error creating checkout session:", error);
                  }
                );
              },
              (error) => {
                toast({
                  title: "Error",
                  description: "Failed to update user data. Please try again.",
                  variant: "destructive",
                });
                console.error("Error updating user document:", error);
              }
            );
          },
          (error) => {
            toast({
              title: "Error",
              description: "Failed to create customer. Please try again.",
              variant: "destructive",
            });
            console.error("Error creating customer:", error);
          }
        );
      }
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

  const renderSubscriptionStep = () => (
    <CardContent>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Choose your ViraNova Subscription</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => {
            const originalPrice = key === 'basic' ? 25 : key === 'pro' ? 65 : 135;
            const discount = ((originalPrice - tier.price) / originalPrice * 100).toFixed(0);
            
            return (
              <div
                key={key}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedTier === key
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
                onClick={() => setSelectedTier(key as SubscriptionTier)}
              >
                <h4 className="text-lg font-semibold mb-2">{tier.name}</h4>
                <div className="mb-2">
                  <span className="text-2xl font-bold">£{tier.price}</span>
                  <span className="text-sm font-normal">/month</span>
                </div>
                <div className="mb-4">
                  <span className="text-sm line-through text-gray-500 mr-2">£{originalPrice}</span>
                  <span className="text-sm font-semibold text-green-500">{discount}% off</span>
                </div>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center">
                    <CheckIcon className="w-4 h-4 mr-2 text-green-500" />
                    {tier.credits} credits
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="w-4 h-4 mr-2 text-green-500" />
                    Up to {tier.shorts} shorts per month
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="w-4 h-4 mr-2 text-green-500" />
                    Track up to {tier.channels} channels
                  </li>
                </ul>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col space-y-1.5 mt-6">
          <Label htmlFor="discountCode">Discount Code</Label>
          <div className="flex space-x-2">
            <Input
              id="discountCode"
              value={discountCode}
              onChange={handleDiscountCodeChange}
              placeholder="Enter discount code"
              disabled={isDiscountApplied}
            />
            <Button onClick={applyDiscountCode} disabled={isDiscountApplied}>
              Apply
            </Button>
          </div>
        </div>
        {isDiscountApplied && (
          <p className="text-green-500">Discount applied: 100% off</p>
        )}
        <div className="mt-6 flex items-center space-x-2">
        <Checkbox
          id="refundPolicy"
          checked={refundPolicyAcknowledged}
          onCheckedChange={(checked) => setRefundPolicyAcknowledged(checked as boolean)}
        />
        <label
          htmlFor="refundPolicy"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I have read and agree to the{" "}
          <span
            className="text-primary cursor-pointer underline"
            onClick={() => setIsRefundPolicyOpen(true)}
          >
            refund policy
          </span>
        </label>
      </div>
        <Button onClick={handleSubmit} className="w-full">Subscribe and Complete Setup</Button>
        <RefundPolicy
          isOpen={isRefundPolicyOpen}
          onClose={() => setIsRefundPolicyOpen(false)}
        />
      </div>
    </CardContent>
  );

  const renderStep = () => {
    if (step === 1) return renderStep1();
    if (step === 2) return renderStep2();
    if (step > 2 && step <= totalSteps) return renderPlatformInfoStep(step - 3);
    if (step === totalSteps + 1) return renderSubscriptionStep();
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
          ) : step === totalSteps ? (
            <Button onClick={() => setStep(step + 1)}>Choose Subscription</Button>
          ) : null}
        </CardFooter>
      </Card>
      <BackgroundBeams />
    </div>
  );
};