import React, { useState } from "react";
import { FirebaseStorageService } from "../../services/storage/strategies";
import {Button} from "../ui/button";
import {RefreshCw, Speaker} from "lucide-react";

export interface AudioProps {
  className?: string;
  path: string;
}

export const AudioPlayer: React.FC<AudioProps> = ({ className = "", path }) => {
  const [source, setSource] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handlePlay = async () => {
    setLoading(true);
    try {
      // Encoding the path to ensure URL compatibility
      const blob = await FirebaseStorageService.downloadFile(path);
      const url = URL.createObjectURL(blob);
      setSource(url);
      console.log('URL: ', url)
      setError(undefined);
      setLoading(false);
    } catch (err) {
      setError('Failed to load audio. Please try again later.');
      console.error(err);
      setLoading(false);
    }
  };

  return <div className={`${className} w-full flex gap-2 items-center justify-start`}>
    <Button
      disabled={loading}
      type="button"
      onClick={() => {
        handlePlay();
      }}
      className="flex items-center gap-2"
    >
      {loading ? <>
      <RefreshCw />
        Loading...
      </> :
        <>
          <Speaker />
          Load Audio
        </>
      }
    </Button>
    {source && <audio src={source} controls autoPlay onError={() => {
      setError('Error playing the audio.');
    }} onEnded={() => URL.revokeObjectURL(source)}/>}
    {error && <div className=" flex-1 p-4 text-sm rounded-lg bg-gray-800 text-red-400" role="alert">
      <span className="font-medium">Error</span> {error}
    </div>}
  </div>;
};
