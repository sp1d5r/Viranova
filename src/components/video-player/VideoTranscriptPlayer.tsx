import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { Segment, Word } from '../../types/collections/Segment';

interface VideoTranscriptPlayerProps {
  segment: Segment;
  className?: string;
}

// Define a type for the debug info object
interface DebugInfo {
  wordsError?: string;
  wordsType?: string;
  totalWords?: number;
  visibleWords?: number;
  currentTime?: number;
  segmentStartTime?: number;
  firstVisibleWord?: {
    word: string;
    originalStart: number;
    adjustedStart: number;
  } | null;
  calculatedDuration?: number;
  earliestStartTime?: number;
  latestEndTime?: number;
  durationError?: string;
  playError?: string;
  adjustedTimeWindow?: {
    min: number;
    max: number;
  };
  firstWord?: {
    word: string;
    start: number;
    end: number;
    adjustedStart: number;
    adjustedEnd: number;
  } | null;
  lastWord?: {
    word: string;
    start: number;
    end: number;
    adjustedStart: number;
    adjustedEnd: number;
  } | null;
  currentWordInfo?: {
    word: string;
    isVisible: boolean;
    adjustedStart: number;
    adjustedEnd: number;
    position: number;
  } | null;
}

const VideoTranscriptPlayer: React.FC<VideoTranscriptPlayerProps> = ({ 
  segment, 
  className = 'w-full h-full'
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [debugMode, setDebugMode] = useState(true);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
  const [visibleWords, setVisibleWords] = useState<Word[]>([]);
  const [seekTo, setSeekTo] = useState<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  // Calculate word position for the sliding effect
  const getWordPosition = useCallback((startTime: number, endTime: number) => {
    // Adjust word timestamps relative to segment start
    const segmentStartTime = segment.earliestStartTime || 0;
    const adjustedStartTime = startTime - segmentStartTime;
    const adjustedEndTime = endTime - segmentStartTime;
    
    const timeWindow = 2; // 2 second window
    const basePosition = 50; // Center position (%)
    
    // Compare with currentTime (which is relative to segment)
    if (adjustedStartTime > currentTime + timeWindow) {
      return 110; // Off-screen right
    } else if (adjustedEndTime < currentTime - 0.5) {
      return -10; // Off-screen left
    }
    
    // Position word based on adjusted time relative to current time
    const position = basePosition + ((adjustedStartTime - currentTime) / timeWindow * 50);
    return Math.max(0, Math.min(100, position));
  }, [currentTime, segment.earliestStartTime]);

  // Log segment data on mount for debugging
  useEffect(() => {
    console.log("VideoTranscriptPlayer - Segment data:", {
      id: segment.id,
      wordsLength: segment.words?.length || 0,
      words: segment.words?.slice(0, 5), // Only log first 5 words to avoid console clutter
      videoPath: segment.videoSegmentLocation,
      startTime: segment.earliestStartTime,
      endTime: segment.latestEndTime
    });

    // Calculate duration from segment times if available
    if (segment.latestEndTime !== undefined && segment.earliestStartTime !== undefined) {
      const calculatedDuration = segment.latestEndTime - segment.earliestStartTime;
      setDuration(calculatedDuration > 0 ? calculatedDuration : 5); // Default to 5 seconds if calculation is invalid
      
      setDebugInfo((prev) => ({
        ...prev,
        calculatedDuration,
        earliestStartTime: segment.earliestStartTime,
        latestEndTime: segment.latestEndTime
      }));
    } else {
      setDebugInfo((prev) => ({
        ...prev,
        durationError: "Missing start or end time",
        earliestStartTime: segment.earliestStartTime,
        latestEndTime: segment.latestEndTime
      }));
    }
  }, [segment]);

  // Update visible words when current time changes
  useEffect(() => {
    // Fix the debugging code to handle array vs object correctly
    console.log("Words array structure:", {
      words: segment.words,
      isArray: Array.isArray(segment.words),
      length: segment.words?.length,
      firstItem: segment.words?.[0],
      firstItemType: segment.words?.[0] ? typeof segment.words[0] : 'undefined',
      isFirstItemArray: segment.words?.[0] ? Array.isArray(segment.words[0]) : false,
      firstItemLength: segment.words?.[0] && Array.isArray(segment.words[0]) ? segment.words[0].length : 0,
      sampleWord: segment.words?.[0] && Array.isArray(segment.words[0]) ? segment.words[0][0] : null
    });
    
    if (!segment.words || !Array.isArray(segment.words)) {
      console.log("No words array found or not an array", segment.words);
      setDebugInfo((prev) => ({
        ...prev,
        wordsError: "No words array found or not an array",
        wordsType: typeof segment.words
      }));
      setVisibleWords([]);
      return;
    }
    
    // Check if words is an array of arrays and flatten it if needed
    let flatWords: Word[] = [];
    if (segment.words.length > 0 && Array.isArray(segment.words[0])) {
      console.log("Detected nested array structure, flattening words array");
      // Flatten the array of arrays into a single array of words
      flatWords = segment.words.flat();
      console.log("Flattened words array:", {
        length: flatWords.length,
        sample: flatWords.slice(0, 3)
      });
    } else {
      flatWords = segment.words as Word[];
    }
    
    // Get segment start time (needed to adjust word timestamps)
    const segmentStartTime = segment.earliestStartTime || 0;
    
    // Filter words based on current playback time
    // The key is to SUBTRACT segmentStartTime from word timestamps
    const currentVisibleWords = flatWords.filter(word => {
      const adjustedStartTime = word.start_time - segmentStartTime;
      const adjustedEndTime = word.end_time - segmentStartTime;
      
      // We want words that:
      // - start before (current time + 2 seconds ahead window)
      // - end after (current time - 0.5 second behind window)
      return adjustedStartTime <= (currentTime + 2) && adjustedEndTime >= (currentTime - 0.5);
    });
    
    setVisibleWords(currentVisibleWords);
    
    // Update debug info
    setDebugInfo((prev) => {
      // Get the first and last words in the segment for debugging
      const firstWord = flatWords[0];
      const lastWord = flatWords[flatWords.length - 1];
      
      // Find a word near the current time for debugging
      const currentSegmentWords = flatWords.filter(w => {
        const adjustedStart = w.start_time - segmentStartTime;
        const adjustedEnd = w.end_time - segmentStartTime;
        return adjustedStart <= currentTime && adjustedEnd >= currentTime;
      });
      
      const currentWordInfo = currentSegmentWords[0] ? {
        word: currentSegmentWords[0].word,
        isVisible: currentVisibleWords.includes(currentSegmentWords[0]),
        adjustedStart: currentSegmentWords[0].start_time - segmentStartTime,
        adjustedEnd: currentSegmentWords[0].end_time - segmentStartTime,
        position: getWordPosition(currentSegmentWords[0].start_time, currentSegmentWords[0].end_time)
      } : null;
      
      return {
        ...prev,
        totalWords: flatWords.length,
        visibleWords: currentVisibleWords.length,
        currentTime,
        segmentStartTime,
        adjustedTimeWindow: {
          min: currentTime - 0.5,
          max: currentTime + 2
        },
        firstWord: firstWord ? {
          word: firstWord.word,
          start: firstWord.start_time,
          end: firstWord.end_time,
          adjustedStart: firstWord.start_time - segmentStartTime,
          adjustedEnd: firstWord.end_time - segmentStartTime
        } : null,
        lastWord: lastWord ? {
          word: lastWord.word,
          start: lastWord.start_time,
          end: lastWord.end_time,
          adjustedStart: lastWord.start_time - segmentStartTime,
          adjustedEnd: lastWord.end_time - segmentStartTime
        } : null,
        firstVisibleWord: currentVisibleWords[0] ? {
          word: currentVisibleWords[0].word,
          originalStart: currentVisibleWords[0].start_time,
          adjustedStart: currentVisibleWords[0].start_time - segmentStartTime
        } : null,
        currentWordInfo
      };
    });
  }, [segment.words, currentTime, segment.earliestStartTime, getWordPosition]);

  // Check if a word is currently being spoken
  const isCurrentWord = useCallback((startTime: number, endTime: number) => {
    // Adjust word timestamps relative to segment start
    const segmentStartTime = segment.earliestStartTime || 0;
    const adjustedStartTime = startTime - segmentStartTime;
    const adjustedEndTime = endTime - segmentStartTime;
    
    // Compare directly with currentTime
    return currentTime >= adjustedStartTime && currentTime <= adjustedEndTime;
  }, [currentTime, segment.earliestStartTime]);

  // Handle video time update
  const handleVideoTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  // Toggle debug mode
  const toggleDebugMode = useCallback(() => {
    setDebugMode(prev => !prev);
  }, []);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    const videoElement = containerRef.current?.querySelector('video');
    if (videoElement) {
      if (videoElement.paused) {
        videoElement.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error("Error playing video:", err);
          setDebugInfo((prev) => ({
            ...prev,
            playError: err.message
          }));
        });
      } else {
        videoElement.pause();
        setIsPlaying(false);
      }
    }
  }, []);

  // Seek to a specific time
  const handleSeek = useCallback((time: number) => {
    // Update seekTo to trigger the VideoPlayer to update
    setSeekTo(time);
    // Also update our local time tracking
    setCurrentTime(time);
  }, []);

  // Listen for play/pause events from the video element
  useEffect(() => {
    const videoElement = containerRef.current?.querySelector('video');
    if (!videoElement) return;
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    
    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative ${className} bg-black overflow-hidden rounded-md`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Main video */}
      <VideoPlayer
        path={segment.videoSegmentLocation || ''}
        setCurrentTime={handleVideoTimeUpdate}
        seekTo={seekTo}
        controls={false}
        className="w-full h-full"
      />
      
      {/* Floating transcript words */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-full h-48">
          {visibleWords.map((word, index) => {
            const position = getWordPosition(word.start_time, word.end_time);
            const isCurrent = isCurrentWord(word.start_time, word.end_time);
            
            return (
              <div
                key={index}
                className={`absolute text-white px-2 py-1 rounded transition-all duration-300 transform
                  ${isCurrent ? 'bg-blue-600 font-bold scale-125' : 'bg-gray-800 bg-opacity-70'}
                `}
                style={{
                  left: `${position}%`,
                  top: '50%',
                  transform: `translate(-50%, -50%) scale(${isCurrent ? 1.25 : 1})`,
                  fontSize: isCurrent ? '1.5rem' : '1.2rem',
                  opacity: position < 10 || position > 90 ? 0.3 : 1,
                  zIndex: 20
                }}
              >
                {word.word}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Debug button */}
      <button 
        onClick={toggleDebugMode}
        className="absolute top-16 right-2 bg-gray-800 text-white p-1 rounded text-xs z-30"
      >
        {debugMode ? "Hide Debug" : "Show Debug"}
      </button>
      
      {/* Debug info */}
      {debugMode && (
        <div className="absolute top-24 left-2 right-2 text-white text-xs bg-black bg-opacity-90 p-2 rounded z-30 max-h-40 overflow-auto">
          <h3 className="font-bold mb-1">Debug Info:</h3>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
      
      {/* Overlay timeline at the top */}
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-70 p-2 z-10">
        <div className="relative h-4 bg-gray-800 rounded overflow-hidden">
          {/* Progress bar */}
          <div 
            className="absolute h-full bg-blue-600"
            style={{ width: `${(currentTime / Math.max(duration, 0.1)) * 100}%` }}
          />
          
          {/* Time markers */}
          {duration > 0 && Array.from({ length: Math.ceil(duration) + 1 }).map((_, second) => (
            <div 
              key={second}
              className="absolute h-full w-px bg-gray-600"
              style={{ left: `${(second / duration) * 100}%` }}
            />
          ))}
          
          {/* Clickable timeline */}
          <div 
            className="absolute top-0 left-0 w-full h-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              handleSeek(pos * duration);
            }}
          />
        </div>
        
        {/* Time counter */}
        <div className="text-white text-xs mt-1 flex justify-between">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      {/* Custom play/pause button */}
      <div 
        className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
        onClick={handlePlayPause}
      >
        {!isPlaying && (
          <div className="w-16 h-16 flex items-center justify-center bg-blue-600 bg-opacity-80 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Bottom controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-3 flex items-center z-10">
          {/* Play/pause button */}
          <button
            onClick={handlePlayPause}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full mr-3 flex items-center justify-center"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          {/* Timeline scrubber */}
          <div 
            className="relative flex-grow h-2 bg-gray-700 rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              handleSeek(pos * duration);
            }}
          >
            <div 
              className="absolute h-full bg-blue-600"
              style={{ width: `${(currentTime / Math.max(duration, 0.1)) * 100}%` }}
            />
          </div>
          
          {/* Time display */}
          <span className="text-white text-sm ml-3">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      )}
      
      {/* Fallback message if no words are available */}
      {(!segment.words || !Array.isArray(segment.words) || segment.words.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="bg-gray-800 p-4 rounded text-white">
            No transcript data available for this segment
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoTranscriptPlayer;