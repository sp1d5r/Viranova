import React, {useEffect, useState} from 'react';
import axios from "axios";
import {getVideoInfo} from "../../services/youtube";
import {Video} from "../../types/Video";
import {VideoCard} from "../cards/video-card/VideoCard";

export interface SegmentVideoMatchingProps{

}

interface SegmentVideoResponse {
  channel_id:string;
  is_segment: boolean,
  score: number,
  segment_id: string,
  video_id: string,
}

export const SegmentVideoMatching :React.FC<SegmentVideoMatchingProps> = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shortVideoId, setShortVideoId] = useState('');
  const [shortVideo, setShortVideo] = useState<Video>();
  const [similarOriginalVideoIds, setSimilarVideoIds] = useState<SegmentVideoResponse[]>([]);
  const [originalVideos, setOriginalVideos] = useState<Video[]>([]);

  const getNewVideos = () => {
    setLoading(true);
    axios.get(`http://165.227.237.249:5000/v2/get-short-and-segments`, { timeout: 500000 })
      .then( response => {
        console.log('Segment Request', response.data)
        if ('error' in response.data){
          setError(response.data['error']);
          setShortVideoId(response.data['video_id']);
          setOriginalVideos([]);
        }

        if ('search_results' in response.data && response.data['search_results'].length > 0){
          setSimilarVideoIds(response.data['search_results'].map((elem: SegmentVideoResponse) => {
            return elem as SegmentVideoResponse
          }));
        }

        if ('search_video_id' in response.data){
          setShortVideoId(response.data['search_video_id'])
          setError('');
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      })
  }

  useEffect(() => {
    getNewVideos();
  }, []);

  useEffect(() => {
    if (shortVideoId){
      getVideoInfo(shortVideoId).then((res) => {
        if (res) setShortVideo(res)
      })
    }
  }, [shortVideoId]);

  // useEffect(() => {
  //   if (similarOriginalVideoIds.length > 0){
  //     Promise.all(similarOriginalVideoIds.map((elem) => {return getVideoInfo(elem.video_id)})).then(
  //       (result) => {
  //         const videoResults = result.filter((elem): elem is Video => elem !== undefined);
  //         setOriginalVideos(videoResults);
  //       }
  //     )
  //   }
  // }, [similarOriginalVideoIds]);


  return <div className="max-w-screen-xl  m-auto my-5 flex flex-col gap-2 p-4">
    <p className="text-4xl text-primary font-bold mb-4">Vector Short & Segment Matching</p>

    {error && (
      <div className="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
        <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
        </svg>
        <span className="sr-only">Info</span>
        <div>
          <span className="font-medium">Error while Querying</span> {error}
        </div>
      </div>
    )}

    {loading && <div role="status" className="m-auto w-full flex flex-col gap-2 justify-center items-center min-h-32">
      <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-green-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
      </svg>
      <span className="sr-only">Loading...</span>
      <p className="text-white font-bold">Loading..</p>
    </div>}

    {
      shortVideo && <div>
        <p className="text-2xl text-white font-bold"> Proposed Short Video</p>
        <VideoCard video={shortVideo}/>
      </div>
    }

    <p className="text-2xl text-white font-bold"> Proposed Segment Matches</p>
    <div className='flex w-full gap-3 flex-wrap'>
      {
        originalVideos && originalVideos.length > 0 && originalVideos.map((elem:Video) => {
          return <VideoCard video={elem}/>
        })

      }
    </div>


    <div className="inline-flex rounded-md shadow-sm m-auto" role="group">
      <button type="button" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border border-gray-900 rounded-s-lg hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">
        1)
      </button>
      {
        similarOriginalVideoIds.map((elem, index) => {
          return <button type="button" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border-t border-r border-b border-gray-900 hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">
            {index + 2})
          </button>
        })
      }
      <button
        type="button"
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border-t border-b border-gray-900 hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700"
        onClick={() => {getNewVideos();}}
      >
        <svg className="w-3 h-3 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12.25V1m0 11.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M4 19v-2.25m6-13.5V1m0 2.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M10 19V7.75m6 4.5V1m0 11.25a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM16 19v-2"/>
        </svg>
        Get New Video
      </button>
      <button type="button" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border border-gray-900 rounded-e-lg hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">
        <svg className="w-3 h-3 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
          <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z"/>
          <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
        </svg>
        Incorrect
      </button>
    </div>

  </div>
}