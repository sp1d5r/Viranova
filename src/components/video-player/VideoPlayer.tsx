import React, {useEffect, useState} from "react";
import {FirebaseStorageService} from "../../services/storage/strategies";
import {LoadingIcon} from "../loading/Loading";

export interface SegmentVideoProps {
  path: string;
  loadingText?: string;
}


export const VideoPlayer: React.FC<SegmentVideoProps> = ({path, loadingText="Loading Video ..."}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [source, setSource] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (path) {
      setLoading(true);
      FirebaseStorageService.downloadFile(path).then((res) => {
        const url = URL.createObjectURL(res);
        console.log(url);
        setSource(url);
        setLoading(false);
      }).catch((err) => {
        setError(err);
        setLoading(false);
      })
    } else {
      setError("Path is empty...");
      setLoading(false);
    }
  }, [path]);

  return <div className="w-full flex-1 py-2">
    {
      loading ?
        <div className="w-full h-full flex justify-center items-center py-16">
          <LoadingIcon id={"video-player-loader"} text={loadingText}/>
        </div> :
        <>
          {
            source ? (
              <video className="w-full" controls>
                <source src={source} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : <p className="text-primary font-bold">
              Value doesn't exist.
            </p>
          }
        </>
    }

    {error && (
      <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
        <span className="font-medium">Error:</span> {error}
      </div>
    )}
  </div>
}
