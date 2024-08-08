import { useState } from 'react';
import FirebaseDatabaseService from '../../services/database/strategies/FirebaseFirestoreService';

type ChannelStatus = "New Channel" | "Added"

export interface Channel {
  status: ChannelStatus;
  channelId: string;
  previous_status: string;
  // Channel information
  efaultLanguage?: string | null;
  hiddenSubscriberCount?: boolean;
  description?: string;
  image?: {
    bannerExternalUrl?: string;
  };
  privacyStatus?: string;
  subscriberCount?: string;
  channel?: {
    title?: string;
    country?: string;
    description?: string;
    keywords?: string;
    unsubscribedTrailer?: string;
  };
  thumbnails?: {
    default?: string;
    high?: string;
    medium?: string;
  };
  title?: string;
  viewCount?: string;
  longUploadsStatus?: string;
  isLinked?: boolean;
  publishedAt?: string;
  videoCount?: string;
  topicCategories?: string[];
  madeForKids?: boolean;
  selfDeclaredMadeForKids?: boolean | null;
  relatedPlaylists?: {
    uploads?: string;
    likes?: string;
  };
  country?: string;
  customUrl?: string;
}

export interface ChannelsTracking {
  uid: string;
  channelsTracking: string[];
}

export interface UsersTrackingChannels {
  uid: string;
  channelId: string;
}

export interface Identifiable {
  id: string;
}

export const useAddChannelToTrack = (currentUserId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addChannelToTrack = async (channelId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if the channel already exists
      const channelExists = await checkChannelExists(channelId);

      if (!channelExists) {
        // Add new channel to the channels collection
        await addNewChannel(channelId);
      }

      // Update ChannelsTracking for the current user
      await updateChannelsTracking(currentUserId, channelId);

      // Add entry to UsersTrackingChannels
      await addUserTrackingChannel(currentUserId, channelId);

      setIsLoading(false);
    } catch (err) {
      setError('Failed to add channel. Please try again.');
      setIsLoading(false);
    }
  };

  const checkChannelExists = async (channelId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      FirebaseDatabaseService.getDocument<Channel>(
        'channels',
        channelId,
        (channel) => resolve(!!channel),
        () => resolve(false)
      );
    });
  };

  const addNewChannel = async (channelId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const newChannel: Channel = {
        status: 'New Channel',
        previous_status: 'Created',
        channelId: channelId,
      };

      FirebaseDatabaseService.updateDocument(
        'channels',
        channelId,
        newChannel,
        () => resolve(),
        (error) => reject(error)
      );
    });
  };

  const updateChannelsTracking = async (userId: string, channelId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      FirebaseDatabaseService.getDocument<ChannelsTracking>(
        'channelstracking',
        userId,
        (existingTracking) => {
          if (existingTracking) {
            // Update existing document
            const updatedChannels = existingTracking.channelsTracking.includes(channelId)
              ? existingTracking.channelsTracking
              : [...existingTracking.channelsTracking, channelId];

            FirebaseDatabaseService.updateDocument<ChannelsTracking>(
              'channelstracking',
              userId,
              { channelsTracking: updatedChannels },
              () => resolve(),
              (error) => reject(error)
            );
          } else {
            // Create new document
            const newTracking: ChannelsTracking = {
              uid: userId,
              channelsTracking: [channelId],
            };
            FirebaseDatabaseService.updateDocument(
              'channelstracking',
              userId,
              newTracking,
              () => resolve(),
              (error) => reject(error)
            );
          }
        },
        (error) => reject(error)
      );
    });
  };

  const addUserTrackingChannel = async (userId: string, channelId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const newUserTrackingChannel: UsersTrackingChannels = {
        uid: userId,
        channelId: channelId,
      };

      FirebaseDatabaseService.addDocument(
        'userstrackingchannels',
        newUserTrackingChannel,
        () => resolve(),
        (error) => reject(error)
      );
    });
  };

  const removeChannelFromTrack = async (channelId: string, channeldeleteChannelDocument: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      // Remove channel from ChannelsTracking for the current user
      await removeFromChannelsTracking(currentUserId, channelId);

      // Remove entry from UsersTrackingChannels
      await removeUserTrackingChannel(currentUserId, channelId);

      // Optionally delete the channel document
      if (channeldeleteChannelDocument) {
        await deleteChannelDocument(channelId);
      }

      setIsLoading(false);
    } catch (err) {
      setError('Failed to remove channel. Please try again.');
      setIsLoading(false);
    }
  };

  const removeFromChannelsTracking = async (userId: string, channelId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      FirebaseDatabaseService.getDocument<ChannelsTracking>(
        'channelstracking',
        userId,
        (existingTracking) => {
          if (existingTracking) {
            const updatedChannels = existingTracking.channelsTracking.filter(id => id !== channelId);
            FirebaseDatabaseService.updateDocument<ChannelsTracking>(
              'channelstracking',
              userId,
              { channelsTracking: updatedChannels },
              () => resolve(),
              (error) => reject(error)
            );
          } else {
            resolve(); // No tracking document exists, nothing to remove
          }
        },
        (error) => reject(error)
      );
    });
  };

  const removeUserTrackingChannel = async (userId: string, channelId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      FirebaseDatabaseService.queryDocuments<UsersTrackingChannels & Identifiable>(
        'userstrackingchannels',
        'uid',
        userId,
        'uid', // orderByField, using 'uid' as it's likely to be indexed
        (documents) => {
          const documentToDelete = documents.find(doc => doc.channelId === channelId);
          if (documentToDelete) {
            FirebaseDatabaseService.deleteDocument(
              'userstrackingchannels',
              documentToDelete.id,
              () => resolve(),
              (error) => reject(error)
            );
          } else {
            resolve(); // No matching document found, nothing to delete
          }
        },
        (error) => reject(error)
      );
    });
  };

  const deleteChannelDocument = async (channelId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      FirebaseDatabaseService.deleteDocument(
        'channels',
        channelId,
        () => resolve(),
        (error) => reject(error)
      );
    });
  };

  return { addChannelToTrack, removeChannelFromTrack, isLoading, error };
};


