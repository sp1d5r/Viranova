import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { Segment, Word } from '../../types/collections/Segment';
import { words } from 'lodash';
import { Logs } from '../../types/collections/Shorts';

interface VideoTranscriptPlayerProps {
  segment: Segment;
  className?: string;
  operations?: Logs[];
  editing?: boolean;
  onWordToggle?: (index: number, status: 'none' | 'deleted') => void;
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

type TranscriptWord = Word & {
  status: 'none' | 'deleted' | 'selected';
  timeStart: number;
  timeEnd: number;
  index: number;
};

const VideoTranscriptPlayer: React.FC<VideoTranscriptPlayerProps> = ({ 
  segment, 
  operations = [],
  editing = false,
  onWordToggle,
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
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [transcriptWords, setTranscriptWords] = useState<TranscriptWord[]>([]);
  const [skipTrimmedContent, setSkipTrimmedContent] = useState(false);
  const [nextWordTime, setNextWordTime] = useState<number | null>(null);
  
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

  // Process segment words and apply operations (deleted/undeleted status)
  useEffect(() => {
    if (!segment.words || !Array.isArray(segment.words)) {
      console.log("No words array found or not an array", segment.words);
      setDebugInfo((prev) => ({
        ...prev,
        wordsError: "No words array found or not an array",
        wordsType: typeof segment.words
      }));
      setTranscriptWords([]);
      return;
    }
    
    // Get flat words array
    let flatWords: Word[] = [];
    if (segment.words.length > 0 && Array.isArray(segment.words[0])) {
      flatWords = segment.words.flat();
    } else {
      flatWords = segment.words as Word[];
    }
    
    // Create transcript words with status
    const processedWords: TranscriptWord[] = flatWords.map((word, index) => ({
      ...word,
      status: 'none',
      timeStart: word.start_time,
      timeEnd: word.end_time,
      index
    }));
    
    // Apply operations
    operations.forEach(operation => {
      if (operation.type === "delete") {
        for (let i = operation.start_index; i <= operation.end_index; i++) {
          if (processedWords[i]) {
            processedWords[i].status = 'deleted';
          }
        }
      }
      if (operation.type === "undelete") {
        for (let i = operation.start_index; i <= operation.end_index; i++) {
          if (processedWords[i]) {
            processedWords[i].status = 'none';
          }
        }
      }
    });
    
    setTranscriptWords(processedWords);
  }, [segment.words, operations]);

  // Handle skipping trimmed content during playback
  useEffect(() => {
    if (!skipTrimmedContent || !isPlaying || !transcriptWords.length) return;
    
    const segmentStartTime = segment.earliestStartTime || 0;
    
    // Find the next non-deleted word after the current time
    const currentIndex = transcriptWords.findIndex(word => {
      const adjustedStartTime = word.timeStart - segmentStartTime;
      const adjustedEndTime = word.timeEnd - segmentStartTime;
      return currentTime >= adjustedStartTime && currentTime <= adjustedEndTime;
    });
    
    if (currentIndex !== -1) {
      // If the current word is deleted, find the next non-deleted word
      if (transcriptWords[currentIndex].status === 'deleted') {
        const nextNonDeletedIndex = transcriptWords.findIndex((word, idx) => 
          idx > currentIndex && word.status !== 'deleted'
        );
        
        if (nextNonDeletedIndex !== -1) {
          const nextWordStartTime = transcriptWords[nextNonDeletedIndex].timeStart - segmentStartTime;
          setNextWordTime(nextWordStartTime);
        }
      } else {
        // If we're on a non-deleted word, check if the next word is deleted
        if (currentIndex < transcriptWords.length - 1) {
          const nextWord = transcriptWords[currentIndex + 1];
          if (nextWord.status === 'deleted') {
            // Find the next non-deleted word after this one
            const nextNonDeletedIndex = transcriptWords.findIndex((word, idx) => 
              idx > currentIndex + 1 && word.status !== 'deleted'
            );
            
            if (nextNonDeletedIndex !== -1) {
              // Set up the next jump point, but don't jump yet
              const nextWordStartTime = transcriptWords[nextNonDeletedIndex].timeStart - segmentStartTime;
              setNextWordTime(nextWordStartTime);
            }
          }
        }
      }
    }
  }, [currentTime, isPlaying, skipTrimmedContent, transcriptWords, segment.earliestStartTime]);

  // Perform the jump to next non-deleted word when needed
  useEffect(() => {
    if (nextWordTime !== null && skipTrimmedContent && isPlaying) {
      handleSeek(nextWordTime);
      setNextWordTime(null);
    }
  }, [nextWordTime, skipTrimmedContent, isPlaying]);

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
    
    // Compute the flattened words array as before
    let flatWords: Word[] = [];
    if (segment.words.length > 0 && Array.isArray(segment.words[0])) {
      flatWords = segment.words.flat();
    } else {
      flatWords = segment.words as Word[];
    }

    // Determine current word index from flatWords
    const currentIndex = flatWords.findIndex(word =>
      isCurrentWord(word.start_time, word.end_time)
    );

    // Define a window size (e.g., 5 words total)
    const contextSize = 5;
    let wordsToShow: Word[] = [];

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

    if (currentIndex !== -1) {
      // Calculate start and end indices ensuring we don't go out-of-bounds
      const start = Math.max(0, currentIndex - Math.floor(contextSize / 2));
      const end = Math.min(flatWords.length, start + contextSize);
      wordsToShow = flatWords.slice(start, end);
    } else {
      // If no current word is found, you might fallback to visible words by time window
      wordsToShow = currentVisibleWords;
    }

    setVisibleWords(wordsToShow);
    
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

  // Handle word toggle (delete/undelete)
  const handleWordToggle = useCallback((index: number) => {
    if (!editing || !onWordToggle) return;
    
    const newStatus = transcriptWords[index]?.status === 'none' ? 'deleted' : 'none';
    onWordToggle(index, newStatus);
    
    // Update local state for immediate feedback
    setTranscriptWords(prev => 
      prev.map((word, i) => 
        i === index 
          ? { ...word, status: newStatus } 
          : word
      )
    );
  }, [transcriptWords, editing, onWordToggle]);

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

  // Find the active word based on current time
  useEffect(() => {
    if (!transcriptWords.length) return;
    
    const segmentStartTime = segment.earliestStartTime || 0;
    
    // Find the index of the word being spoken at current time
    const index = transcriptWords.findIndex(word => {
      const adjustedStartTime = word.start_time - segmentStartTime;
      const adjustedEndTime = word.end_time - segmentStartTime;
      return currentTime >= adjustedStartTime && currentTime <= adjustedEndTime;
    });
    
    setActiveWordIndex(index >= 0 ? index : null);
    
    // Scroll the active word into view
    if (index >= 0 && transcriptRef.current) {
      const wordElements = transcriptRef.current.querySelectorAll('.transcript-word');
      if (wordElements[index]) {
        wordElements[index].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }
    }
  }, [currentTime, transcriptWords, segment.earliestStartTime]);

  return (
    <div 
      ref={containerRef}
      className={`relative ${className} bg-black overflow-hidden rounded-md`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1 cursor-pointer text-sm">
          <input 
            type="checkbox" 
            checked={skipTrimmedContent}
            onChange={() => setSkipTrimmedContent(!skipTrimmedContent)}
            className="h-3 w-3"
          />
          Skip Trimmed
        </label>
      </div>
      {/* Main video */}
      <VideoPlayer
        path={segment.videoSegmentLocation || ''}
        setCurrentTime={handleVideoTimeUpdate}
        seekTo={seekTo}
        controls={false}
        className="w-full h-full"
      />
      
      {/* Scrollable transcript */}
      <div className="absolute bottom-16 left-0 right-0 bg-black bg-opacity-80 max-h-32 overflow-y-auto z-20 p-3">
        <div ref={transcriptRef} className="flex flex-wrap gap-1 justify-center">
          {transcriptWords.map((word, index) => {
            const isActive = index === activeWordIndex;
            const segmentStartTime = segment.earliestStartTime || 0;
            const adjustedStartTime = word.start_time - segmentStartTime;
            
            return (
              <span
                key={index}
                className={`transcript-word cursor-pointer px-1 py-0.5 rounded transition-all duration-150
                  ${isActive ? 'bg-green-600 text-white font-bold' : ''}
                  ${word.status === 'deleted' ? 'bg-red-600 text-white' : 'text-white hover:bg-gray-700'}
                  ${editing ? 'hover:bg-blue-600' : ''}
                `}
                onClick={() => editing ? handleWordToggle(index) : handleSeek(adjustedStartTime)}
              >
                {word.word}
              </span>
            );
          })}
        </div>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex justify-around items-center mt-[20%] w-full max-w-md">
          {visibleWords.map((word, index) => {
            const isCurrent = isCurrentWord(word.start_time, word.end_time);
            const wordIndex = transcriptWords.findIndex(tw => 
              tw.start_time === word.start_time && tw.end_time === word.end_time
            );
            const isDeleted = wordIndex >= 0 && transcriptWords[wordIndex].status === 'deleted';
            
            return (
              <div
                key={index}
                className={`px-2 py-1 rounded transition-all duration-300 ${
                  isCurrent ? 'bg-green-600 font-bold scale-125 text-white' : 
                  isDeleted ? 'bg-red-600 bg-opacity-70 text-white' : 
                  'bg-gray-800 bg-opacity-70 text-white'
                }`}
                style={{
                  fontSize: isCurrent ? '1.5rem' : '1.2rem',
                  opacity: isDeleted ? 0.5 : isCurrent ? 1 : 0.7,
                  zIndex: isCurrent ? 20 : 10,
                  textDecoration: isDeleted ? 'line-through' : 'none'
                }}
              >
                {word.word}
              </div>
            );
          })}
        </div>
      </div>

    
      {/* Overlay timeline at the top */}
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-70 p-2 z-10">
        <div className="relative h-8 bg-gray-800 rounded overflow-hidden">
          {/* Progress bar */}
          <div 
            className="absolute h-full bg-blue-600 opacity-30"
            style={{ width: `${(currentTime / Math.max(duration, 0.1)) * 100}%` }}
          />
          
          <div className='absolute h-full w-full'>
          {(() => {
            if (transcriptWords.length === 0) return null;
            
            const segmentStartTime = segment.earliestStartTime || 0;
            const segmentDuration = segment.latestEndTime - segmentStartTime;
            
            // Generate continuous timeline segments that represent the content flow
            // We'll create segments that extend from one word's start to the next word's start
            return transcriptWords.map((word, index) => {
              const adjustedStartTime = word.start_time - segmentStartTime;
              const startPercent = (adjustedStartTime / segmentDuration) * 100;
              
              // For width calculation, we need to determine where this segment ends
              let endPercent;
              if (index < transcriptWords.length - 1) {
                // If not the last word, extend to the start of the next word
                const nextWordStartTime = transcriptWords[index + 1].start_time - segmentStartTime;
                endPercent = (nextWordStartTime / segmentDuration) * 100;
              } else {
                // If last word, extend to the end of the segment or the word's end time
                const adjustedEndTime = word.end_time - segmentStartTime;
                endPercent = (adjustedEndTime / segmentDuration) * 100;
              }
              
              const widthPercent = endPercent - startPercent;
              
              return (
                <div 
                  key={index}
                  className={`absolute h-full ${word.status === 'deleted' ? 'bg-red-600' : 'bg-green-600'}`}
                  style={{ 
                    left: `${startPercent}%`,
                    width: `${Math.max(0.1, widthPercent)}%`,
                    opacity: 0.7
                  }}
                  title={word.word}
                />
              );
            });
          })()}
          </div>

          {/* Time markers */}
          {duration > 0 && Array.from({ length: Math.ceil(duration) + 1 }).map((_, second) => (
            <div 
              key={second}
              className="absolute h-full w-px bg-gray-600"
              style={{ left: `${(second / duration) * 100}%`, zIndex: 2 }}
            />
          ))}
          
          {/* Playhead indicator */}
          <div
            className="absolute h-full w-1 bg-white"
            style={{ left: `${(currentTime / Math.max(duration, 0.1)) * 100}%`, zIndex: 5 }}
          />
          
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
        
        {/* Time counter and Skip Trimmed toggle */}
        <div className="text-white text-xs mt-1 flex justify-between items-center">
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
          <div className="w-16 h-16 flex items-center justify-center bg-green-600 bg-opacity-80 rounded-full">
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
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full mr-3 flex items-center justify-center"
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
              className="absolute h-full bg-green-600"
              style={{ width: `${(currentTime / Math.max(duration, 0.1)) * 100}%` }}
            />
          </div>
          
          {/* Skip Trimmed toggle for bottom controls */}
          <div className="flex items-center ml-3 mr-3">
            <label className="flex items-center gap-1 cursor-pointer text-white text-sm">
              <input 
                type="checkbox" 
                checked={skipTrimmedContent}
                onChange={() => setSkipTrimmedContent(!skipTrimmedContent)}
                className="h-3 w-3"
              />
              Skip Trimmed
            </label>
          </div>
          
          {/* Time display */}
          <span className="text-white text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      )}
      
      {/* Fallback message if no words are available */}
      {(!transcriptWords.length) && (
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