import React, { useState } from "react";
import { FirebaseStorageService } from "../../services/storage/strategies";
import {Button} from "../ui/button";

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
      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center">
      {loading ? <>
      <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin"
            viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="#E5E7EB"/>
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentColor"/>
      </svg>
        Loading...
      </> :
        <>
          <svg className="w-6 h-6 text-white me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 16H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v1M9 12H4m8 8V9h8v11h-8Zm0 0H9m8-4a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z"/>
          </svg>
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
