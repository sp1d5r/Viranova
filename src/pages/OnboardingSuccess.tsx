import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../contexts/Authentication";
import { useToast } from "../components/ui/use-toast";
import FirebaseFirestoreService from "../services/database/strategies/FirebaseFirestoreService";
import { SUBSCRIPTION_TIERS, getSubscriptionDetails } from "../types/collections/User";

export const OnboardingSuccess: React.FC = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const processingLock = useRef(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const userId = queryParams.get('userId');

    const completeOnboarding = async () => {
      if (processingLock.current) return; // Prevent double processing
      processingLock.current = true;

      if (!userId || !authState.user) {
        toast({
          title: "Error",
          description: "Invalid user data. Please try again.",
          variant: "destructive",
        });
        navigate('/onboarding');
        return;
      }

      try {
        await FirebaseFirestoreService.getDocument(
          "users",
          userId,
          async (userData: any) => {
            if (userData && userData.paymentPending) {
              const tierDetails = getSubscriptionDetails(userData.selectedTier);

              // Update user document with subscription details and credits
              await FirebaseFirestoreService.updateDocument(
                "users",
                userId,
                {
                  paymentPending: false,
                  subscription: {
                    status: 'active',
                    tier: userData.selectedTier,
                    startDate: new Date(),
                    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                  },
                  credits: {
                    current: tierDetails.credits,
                    monthlyAllocation: tierDetails.credits,
                  },
                },
                () => {
                  toast({
                    title: "Success",
                    description: "Your subscription has been activated!",
                  });
                  navigate('/dashboard');
                },
                (error) => {
                  toast({
                    title: "Error",
                    description: "Failed to update subscription details. Please contact support.",
                    variant: "destructive",
                  });
                  console.error("Error updating user document:", error);
                }
              );
            } else {
              toast({
                title: "Info",
                description: "Subscription already processed or payment not pending.",
              });
              navigate('/dashboard');
            }
          },
          (error) => {
            toast({
              title: "Error",
              description: "Failed to fetch user data. Please try again.",
              variant: "destructive",
            });
            console.error("Error fetching user document:", error);
          }
        );
      } catch (error) {
        console.error("Error in completeOnboarding:", error);
        toast({
          title: "Error",
          description: "An error occurred. Please contact support.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        processingLock.current = false;
      }
    };

    completeOnboarding();
  }, [authState.user, location.search, navigate, toast]);

  if (isLoading) {
    return <div>Processing your subscription...</div>;
  }

  return null; // The component will navigate away after processing, so we don't need to render anything
};