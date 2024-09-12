import { useAuth } from './Authentication';
import FirebaseDatabaseService from '../services/database/strategies/FirebaseFirestoreService';
import { WouldYouRatherRequest, WouldYouRatherEndpoints } from '../types/collections/Request';
import { Timestamp } from 'firebase/firestore';
import { useUser } from "./UserProvider";
import { useToast } from "../components/ui/use-toast";

export const useWouldYouRatherRequestManagement = () => {
  const { authState } = useAuth();
  const { userData } = useUser();
  const { toast } = useToast();

  const createWouldYouRatherRequest = async (
    nicheId: string,
    requestEndpoint: WouldYouRatherEndpoints,
    creditCost: number,
    onSuccess?: (requestId: string) => void,
    onFailure?: (error: Error) => void,
    ideaId?: string
  ) => {
    if (!authState.user) {
      onFailure?.(new Error('User not authenticated'));
      return;
    }

    if (!userData || !userData.credits) {
      onFailure?.(new Error('User data or credits not available'));
      return;
    }

    if (userData.credits.current < creditCost) {
      toast({
        title: "Insufficient Credits",
        description: `This action requires ${creditCost} credits. Your current balance is ${userData.credits.current} credits.`,
        variant: "destructive",
      });
      onFailure?.(new Error('Insufficient credits'));
      return;
    }

    const currentDate = new Date();
    const requestCreatedTimestamp = Timestamp.fromDate(currentDate);

    const request: WouldYouRatherRequest = {
      requestOperand: 'wyr',
      requestEndpoint: requestEndpoint,
      requestCreated: requestCreatedTimestamp,
      uid: authState.user.uid,
      nicheId: nicheId,
      creditCost: creditCost,
    };

    if (ideaId) request.ideaId = ideaId;

    try {
      const requestId = await FirebaseDatabaseService.addDocument(
        'requests',
        request,
        (id) => {
          console.log(`WouldYouRather request created with ID: ${id}`);
          onSuccess?.(id);
        },
        (error) => { throw error; }
      );
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
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

  const getWouldYouRatherRequests = async (
    nicheId: string,
    onSuccess?: (requests: WouldYouRatherRequest[]) => void,
    onFailure?: (error: Error) => void
  ) => {
    if (!authState.user) {
      onFailure?.(new Error('User not authenticated'));
      return;
    }

    await FirebaseDatabaseService.queryDocuments<WouldYouRatherRequest>(
      'requests',
      'nicheId',
      nicheId,
      'requestCreated',
      (requests) => {
        const wyrRequests: WouldYouRatherRequest[] = requests
          .filter(req => req.requestOperand === 'wyr')
          .map(elem => elem as WouldYouRatherRequest);
        onSuccess?.(wyrRequests);
      },
      onFailure
    );
  };

  const getUserWouldYouRatherRequests = async (
    onSuccess?: (requests: WouldYouRatherRequest[]) => void,
    onFailure?: (error: Error) => void
  ) => {
    if (!authState.user) {
      onFailure?.(new Error('User not authenticated'));
      return;
    }

    await FirebaseDatabaseService.queryDocuments<WouldYouRatherRequest>(
      'requests',
      'uid',
      authState.user.uid,
      'requestCreated',
      (requests) => {
        const wyrRequests: WouldYouRatherRequest[] = requests
          .filter(req => req.requestOperand === 'wyr')
          .map(elem => elem as WouldYouRatherRequest);
        onSuccess?.(wyrRequests);
      },
      onFailure
    );
  };

  return { createWouldYouRatherRequest, getWouldYouRatherRequests, getUserWouldYouRatherRequests };
};