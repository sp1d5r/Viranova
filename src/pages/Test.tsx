import React, { useState, useEffect, useRef } from 'react';

const VideoTimelineUI = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(5); // Default to 5 seconds
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // Single segment with words for the 5-second video
  const segment = {
    id: "seg1",
    earliestStartTime: 0,
    latestEndTime: 5.0,
    segmentTitle: "Main Content",
    segmentStatus: "ready",
    words: [
      { start_time: 0.1, end_time: 0.5, word: "Welcome" },
      { start_time: 0.5, end_time: 0.9, word: "to" },
      { start_time: 0.9, end_time: 1.3, word: "this" },
      { start_time: 1.3, end_time: 1.7, word: "video" },
      { start_time: 1.7, end_time: 2.1, word: "with" },
      { start_time: 2.1, end_time: 2.5, word: "overlay" },
      { start_time: 2.5, end_time: 2.9, word: "timeline" },
      { start_time: 2.9, end_time: 3.3, word: "showing" },
      { start_time: 3.3, end_time: 3.7, word: "the" },
      { start_time: 3.7, end_time: 4.1, word: "transcript" },
      { start_time: 4.1, end_time: 4.5, word: "words" },
      { start_time: 4.5, end_time: 5.0, word: "inline" }
    ]
  };

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoaded(true);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      video.currentTime = 0;
    };
    
    // Add event listeners
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    
    // Cleanup
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, []); // Empty dependency array means this runs once

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  // Toggle play/pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused || video.ended) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Automatic playback started
            setIsPlaying(true);
          })
          .catch(error => {
            // Auto-play was prevented
            console.error("Play error:", error);
            setIsPlaying(false);
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Seek to position
  const seekTo = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    // Make sure time is within valid range
    const clampedTime = Math.max(0, Math.min(time, duration));
    
    // Set time
    video.currentTime = clampedTime;
    setCurrentTime(clampedTime);
  };

  // Get current words based on playback position
  const getCurrentWords = () => {
    // Return words that would be visible based on current time
    // We'll show words from now to +2 seconds ahead
    return segment.words.filter(word => 
      word.start_time <= currentTime + 2 && 
      word.end_time >= currentTime - 0.5
    );
  };

  // Calculate word position for the sliding effect
  const getWordPosition = (startTime: number, endTime: number) => {
    const timeWindow = 2; // 2 second window
    const basePosition = 50; // Center position (%)
    
    if (startTime > currentTime + timeWindow) {
      return 110; // Off-screen right
    } else if (endTime < currentTime - 0.5) {
      return -10; // Off-screen left
    }
    
    // Position word based on its time relative to current time
    const position = basePosition + ((startTime - currentTime) / timeWindow * 50);
    return Math.max(0, Math.min(100, position));
  };

  return (
    <div 
      className="relative w-full h-full bg-black overflow-hidden"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Main video */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        src="https://samplelib.com/lib/preview/mp4/sample-5s.mp4"
        preload="auto"
        playsInline
        onClick={togglePlay}
        poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23000'/%3E%3Ctext x='50' y='50' font-size='10' text-anchor='middle' alignment-baseline='middle' fill='%23fff'%3ELoading Video...%3C/text%3E%3C/svg%3E"
      />
      
      {/* Play/Pause overlay button (shows when paused) */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-16 h-16 flex items-center justify-center bg-blue-600 bg-opacity-80 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
      
      {/* Overlay timeline at the top */}
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-70 p-2">
        <div className="relative h-4 bg-gray-800 rounded overflow-hidden">
          {/* Buffer indicator */}
          <div 
            className="absolute h-full bg-gray-600 bg-opacity-50"
            style={{ width: `100%` }}
          />
          
          {/* Progress bar */}
          <div 
            className="absolute h-full bg-blue-600"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          
          {/* Time markers */}
          {[0, 1, 2, 3, 4, 5].map(second => (
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
              seekTo(pos * duration);
            }}
          />
        </div>
        
        {/* Time counter */}
        <div className="text-white text-xs mt-1 flex justify-between">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      {/* Floating transcript words */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-full h-48">
          {getCurrentWords().map((word, index) => {
            const position = getWordPosition(word.start_time, word.end_time);
            const isCurrent = currentTime >= word.start_time && currentTime <= word.end_time;
            
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
                  opacity: position < 10 || position > 90 ? 0.3 : 1
                }}
              >
                {word.word}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Bottom controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-3 flex items-center">
          {/* Play/pause button */}
          <button
            onClick={togglePlay}
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
              seekTo(pos * duration);
            }}
          >
            <div 
              className="absolute h-full bg-blue-600"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          
          {/* Time display */}
          <span className="text-white text-sm ml-3">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      )}
      
      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-lg">Loading video...</div>
        </div>
      )}
    </div>
  );
};

export default VideoTimelineUI;