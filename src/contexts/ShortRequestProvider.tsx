import { useAuth } from './Authentication';
import FirebaseDatabaseService from '../services/database/strategies/FirebaseFirestoreService';
import {ShortRequest, ShortRequestEndpoints} from '../types/collections/Request';
import { Timestamp } from 'firebase/firestore';
import {Short} from "../types/collections/Shorts";
import {useUser} from "./UserProvider";
import {useToast} from "../components/ui/use-toast";

export const useShortRequestManagement = () => {
  const { authState } = useAuth();
  const { userData } = useUser();
  const { toast } = useToast();

  const createShortRequest = async (
    shortId: string,
    requestEndpoint: ShortRequestEndpoints,
    creditCost: number, // Add credit cost as a parameter
    onSuccess?: (requestId: string) => void,
    onFailure?: (error: Error) => void,
    autoGenerate: boolean = false,
  ) => {
    if (!authState.user) {
      onFailure?.(new Error('User not authenticated'));
      return;
    }

    if (!userData || (userData.credits && !userData.credits)) {
      onFailure?.(new Error('Insufficient credits'));
      return;
    }

    // Check if user has enough credits (client-side check for UX purposes)
    if (userData?.credits!.current < creditCost) {
      toast({
        title: "Insufficient Credits",
        description: `This action requires ${creditCost} credits. Your current balance is ${userData.credits!.current} credits.`,
        variant: "destructive",
      });
      onFailure?.(new Error('Insufficient credits'));
      return;
    }

    const currentDate = new Date();
    const requestCreatedTimestamp = Timestamp.fromDate(currentDate);

    if (autoGenerate) {
      FirebaseDatabaseService.updateDocument<Short>(
        "shorts",
        shortId,
        {
          auto_generate: true,
          progress_message: "Beginning auto-generate. Please wait..."
        }
      )
    }

    const request: ShortRequest = {
      requestOperand: 'short',
      requestEndpoint: requestEndpoint,
      requestCreated: requestCreatedTimestamp,
      uid: authState.user.uid,
      shortId: shortId,
      creditCost: creditCost, // Include credit cost in the request
    };

    try {
      const requestId = await FirebaseDatabaseService.addDocument(
        'requests',
        request,
        (id) => {
          console.log(`Request created with ID: ${id}`);
          onSuccess?.(id);
        },
        (error) => { throw error; }
      );

    } catch (error) {
      if (error instanceof Error) {
        // Check if the error is related to insufficient credits
        if (error.message.includes('Insufficient credits')) {
          toast({
            title: "Credit Deduction Failed",
            description: "You don't have enough credits for this action.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Request Failed",
            description: "An error occurred while processing your request.",
            variant: "destructive",
          });
        }
        onFailure?.(error);
      }
    }
  };

  const getShortRequests = async (
    shortId: string,
    onSuccess?: (requests: ShortRequest[]) => void,
    onFailure?: (error: Error) => void
  ) => {
    if (!authState.user) {
      onFailure?.(new Error('User not authenticated'));
      return;
    }

    await FirebaseDatabaseService.queryDocuments(
      'requests',
      'shortId',
      shortId,
      'requestCreated',
      (requests) => {
        // Filter requests by the current user's ID
        const userRequests: ShortRequest[] = requests.map((elem) => {
          return elem as ShortRequest
        })
        onSuccess?.(userRequests);
      },
      onFailure
    );
  };

  const getUserRequests = async (
    uid: string,
    onSuccess?: (requests: ShortRequest[]) => void,
    onFailure?: (error: Error) => void
  ) => {
    if (!authState.user) {
      onFailure?.(new Error('User not authenticated'));
      return;
    }

    await FirebaseDatabaseService.queryDocuments(
      'requests',
      'uid',
      uid,
      'requestCreated',
      (requests) => {
        // Filter requests by the current user's ID
        const userRequests: ShortRequest[] = requests.map((elem) => {
          return elem as ShortRequest
        })
        onSuccess?.(userRequests);
      },
      onFailure
    );
  };

  const getUserId = () => {
    return authState.user?.uid || null;
  };

  return { createShortRequest, getShortRequests, getUserRequests, getUserId };
};