import { useAuth } from './Authentication';
import FirebaseDatabaseService from '../services/database/strategies/FirebaseFirestoreService';
import {ShortRequest, ShortRequestEndpoints} from '../types/collections/Request';
import { Timestamp } from 'firebase/firestore';
import {Short} from "../types/collections/Shorts";

export const useShortRequestManagement = () => {
  const { authState } = useAuth();

  const createShortRequest = async (
    shortId: string,
    requestEndpoint: ShortRequestEndpoints,
    onSuccess?: (requestId: string) => void,
    onFailure?: (error: Error) => void,
    autoGenerate: boolean = false,
  ) => {
    if (!authState.user) {
      onFailure?.(new Error('User not authenticated'));
      return;
    }

    const currentDate = new Date();
    const requestCreatedTimestamp =  Timestamp.fromDate(currentDate);

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
      shortId: shortId
    };

    await FirebaseDatabaseService.addDocument(
      'requests',
      request,
      (requestId) => {
        console.log(`Request created with ID: ${requestId}`);
        onSuccess?.(requestId);
      },
      onFailure
    );
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