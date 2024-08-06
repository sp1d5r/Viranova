import React, { useState, useEffect } from 'react';
import { Short } from "../../../../types/collections/Shorts";
import { Segment } from "../../../../types/collections/Segment";
import { FirebaseStorageService } from "../../../../services/storage/strategies";
import { uniqueId } from "lodash";
import VideoPlayer from './VideoPlayer';
import ItemEditor from './ItemEditor';
import TrackList from './TrackList';
import { Track, TrackItem } from './types';
import {Button} from "../../../ui/button";

interface BRollTabContentProps {
  short: Short;
  shortId: string;
  segment: Segment;
}

const BRollTab: React.FC<BRollTabContentProps> = ({ short, shortId, segment }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const totalFrames = short.total_frame_count;
  const [tracks, setTracks] = useState<Track[]>([
    { id: '1', name: 'B-Roll Track 1', items: [] },
  ]);
  const [selectedItem, setSelectedItem] = useState<TrackItem | null>(null);

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
    if (short.short_a_roll) {
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
              height: 100
            }
            : {
              type: 'video',
              src: '', // You'll need to provide a way to select a video source
              x: 0,
              y: 0,
              width: 100,
              height: 100,
              offset: 0
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

  if (!short.short_a_roll) {
    return <p className="text-red-500">You need to generate the A-Roll first little man!</p>;
  }

  return (
    <div className="b-roll-container text-black">
      <div className="w-full flex justify-center items-center gap-2 my-5">
        <VideoPlayer
          videoUrl={videoUrl}
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          tracks={tracks}
          short={short}
        />
        <ItemEditor
          selectedItem={selectedItem}
          onItemUpdate={handleItemUpdate}
          onItemDelete={handleItemDelete}
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
      <div className="flex w-full justify-between items-center">
        <Button
          onClick={handleAddTrack}
          variant="secondary"
        >
          Add Track
        </Button>
        <Button
          onClick={handleAddTrack}
        >
          Generate B-Roll
        </Button>
      </div>
    </div>
  );
};

export default BRollTab;