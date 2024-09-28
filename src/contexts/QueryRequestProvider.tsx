import { useAuth } from './Authentication';
import FirebaseDatabaseService from '../services/database/strategies/FirebaseFirestoreService';
import { QueryRequest, QueryRequestEndpoints } from '../types/collections/Request';
import { Timestamp } from 'firebase/firestore';
import { useUser } from "./UserProvider";
import { useToast } from "../components/ui/use-toast";

export const useQueryRequestManagement = () => {
  const { authState } = useAuth();
  const { userData } = useUser();
  const { toast } = useToast();

  const createQueryRequest = async (
    queryId: string,
    requestEndpoint: QueryRequestEndpoints,
    creditCost: number,
    onSuccess?: (requestId: string) => void,
    onFailure?: (error: Error) => void
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

    const request: QueryRequest = {
      requestOperand: 'query',
      requestEndpoint: requestEndpoint,
      requestCreated: requestCreatedTimestamp,
      uid: authState.user.uid,
      queryId: queryId,
      creditCost: creditCost,
    };

    try {
      const requestId = await FirebaseDatabaseService.addDocument(
        'requests',
        request,
        (id) => {
          console.log(`Query request created with ID: ${id}`);
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

  const getQueryRequests = async (
    queryId: string,
    onSuccess?: (requests: QueryRequest[]) => void,
    onFailure?: (error: Error) => void
  ) => {
    if (!authState.user) {
      onFailure?.(new Error('User not authenticated'));
      return;
    }

    await FirebaseDatabaseService.queryDocuments<QueryRequest>(
      'requests',
      'queryId',
      queryId,
      'requestCreated',
      (requests) => {
        const queryRequests: QueryRequest[] = requests
          .filter(req => req.requestOperand === 'query')
          .map(elem => elem as QueryRequest);
        onSuccess?.(queryRequests);
      },
      onFailure
    );
  };

  const getUserQueryRequests = async (
    onSuccess?: (requests: QueryRequest[]) => void,
    onFailure?: (error: Error) => void
  ) => {
    if (!authState.user) {
      onFailure?.(new Error('User not authenticated'));
      return;
    }

    await FirebaseDatabaseService.queryDocuments<QueryRequest>(
      'requests',
      'uid',
      authState.user.uid,
      'requestCreated',
      (requests) => {
        const queryRequests: QueryRequest[] = requests
          .filter(req => req.requestOperand === 'query')
          .map(elem => elem as QueryRequest);
        onSuccess?.(queryRequests);
      },
      onFailure
    );
  };

  return { createQueryRequest, getQueryRequests, getUserQueryRequests };
};