import React, { useState, useEffect } from 'react';
import { Short, Track, TrackItem } from "../../../../types/collections/Shorts";
import { FirebaseStorageService } from "../../../../services/storage/strategies";
import { uniqueId } from "lodash";
import VideoPlayer from './VideoPlayer';
import ItemEditor from './ItemEditor';
import TrackList from './TrackList';
import { Alert, AlertDescription, AlertTitle } from '../../../ui/alert';
import {Button} from "../../../ui/button";
import FirebaseFirestoreService from "../../../../services/database/strategies/FirebaseFirestoreService";
import {Terminal} from "lucide-react";
import {useNotification} from "../../../../contexts/NotificationProvider";

interface BRollTabContentProps {
  short: Short;
  shortId: string;
}

const BRollTab: React.FC<BRollTabContentProps> = ({ short, shortId }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const totalFrames = short.total_frame_count;
  const [tracks, setTracks] = useState<Track[]>([
    { id: '1', name: 'B-Roll Track 1', items: [] },
  ]);
  const [selectedItem, setSelectedItem] = useState<TrackItem | null>(null);
  const [fps, setFps] = useState(30);
  const {showNotification} = useNotification();

  useEffect(() => {
    if (fps != short.fps) {
      setFps(short.fps);
    }
  }, []);

  useEffect(() => {
    if (short.b_roll_tracks) {
      setTracks(short.b_roll_tracks);
    }
  }, []);

  const loadVideo = async (url: string) => {
    try {
      const res = await FirebaseStorageService.downloadFile(url);
      return URL.createObjectURL(res);
    } catch (err) {
      console.error(`Failed to load video: ${url}`, err);
      return undefined;
    }
  };

  useEffect(() => {
    if (short.short_a_roll && !videoUrl) {
      loadVideo(short.short_a_roll).then(url =>
        setVideoUrl(url)
      );
    }
  }, [short]);

  const handleAddItem = (trackId: string, type: 'image' | 'video') => {
    setTracks(prevTracks => {
      const newTracks = [...prevTracks];
      const track = newTracks.find(t => t.id === trackId);
      if (track) {
        const newItem: TrackItem = {
          id: uniqueId(),
          start: 0,
          end: Math.min(300, totalFrames),
          objectMetadata: type === 'image'
            ? {
              type: 'image',
              src: '/api/placeholder/400/320',
              x: 0,
              y: 0,
              width: 100,
              height: 100,
              uploadType: 'link',
            }
            : {
              type: 'video',
              src: '', // You'll need to provide a way to select a video source
              x: 0,
              y: 0,
              width: 100,
              height: 100,
              offset: 0,
              uploadType: 'link',
            }
        };
        track.items.push(newItem);
      }
      return newTracks;
    });
  };


  const handleAddTrack = () => {
    setTracks(prevTracks => [
      ...prevTracks,
      { id: uniqueId(), name: `B-Roll Track ${prevTracks.length + 1}`, items: [] }
    ]);
  };

  const handleItemSelect = (item: TrackItem) => {
    setSelectedItem(item);
  };

  const handleItemDelete = (itemId: string) => {
    setTracks(prevTracks =>
      prevTracks.map(track => ({
        ...track,
        items: track.items.filter(item => item.id !== itemId)
      }))
    );
    setSelectedItem(null); // Clear the selected item after deletion
  };

  const handleItemUpdate = (updatedItem: TrackItem) => {
    setTracks(prevTracks =>
      prevTracks.map(track => ({
        ...track,
        items: track.items.map(item =>
          item.id === updatedItem.id ? updatedItem : item
        )
      }))
    );
    setSelectedItem(updatedItem);
  };

  const updateShort = () => {
    FirebaseFirestoreService.updateDocument(
      "shorts",
      shortId,
      {
        b_roll_tracks: JSON.stringify(tracks),
      },
      () => {
        console.log('success');
      },
      () => {
        console.log('failed');
      }
    )
  }

  useEffect(() => {
    updateShort()
  }, [tracks]);


  if (!short.short_a_roll) {
    return <p className="text-red-500">You need to generate the A-Roll first little man!</p>;
  }

  return (
    <div className="text-white dark:text-black">
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Feature in Beta</AlertTitle>
        <AlertDescription>
          Adding B-Roll is currently in development... that's why it looks like this. Feel free to test and provide feedback at {' '}
          <a className="text-primary underline" href="mailto:elijahahmad03@gmail.com">elijahahmad03@gmail.com</a>.
        </AlertDescription>
      </Alert>
      <div className="flex-wrap md:flex-nowrap w-full flex justify-center items-center gap-2 my-5">
        <VideoPlayer
          videoUrl={videoUrl}
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          tracks={tracks}
          fps={fps}
        />
        <ItemEditor
          selectedItem={selectedItem}
          onItemUpdate={handleItemUpdate}
          onItemDelete={handleItemDelete}
          shortId={shortId}
        />
      </div>
      <TrackList
        tracks={tracks}
        totalFrames={totalFrames}
        currentTime={currentTime}
        onAddItem={handleAddItem}
        onItemSelect={handleItemSelect}
        onTracksUpdate={setTracks}
      />
      <div className="flex w-full justify-between items-center gap-2">
        <Button
          onClick={handleAddTrack}
          variant="secondary"
        >
          Add Track
        </Button>
        <div className="flex-1" />
        <Button
          className="text-white"
          onClick={() => {
            FirebaseFirestoreService.updateDocument(
              'shorts',
              shortId,
              {
                'short_b_roll': short['short_a_roll']
              },
              () => {
                showNotification("Using A-Roll", "Using A-Roll for footage", "success");
              },
              (error) => {
                showNotification("Failed to use A-Roll", error.message, "error");
              }
            )
          }}
          variant="outline"
        >
          Use A-Roll
        </Button>
        <Button
          cooldown={100}
          onClick={() => {
            FirebaseFirestoreService.updateDocument(
              "shorts",
              shortId,
              {
                short_status: "Generate B-Roll",
                previous_short_status: "Generating B-Roll"
              },
              () => {
                showNotification("Requested B-Roll", "Generating B-Roll", "success");
              },
              (error) => {
                showNotification("Failed to generate B-Roll", error.message, "error");
              }
            )
          }}
        >
          Generate B-Roll
        </Button>
      </div>
    </div>
  );
};

export default BRollTab;