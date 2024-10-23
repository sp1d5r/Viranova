import React, { useState, useRef, useEffect } from 'react';
import { Segment } from '../../../types/collections/Segment';

interface VideoTranscriptEditorProps {
  segment: Segment;
  onTranscriptChange: (newTranscript: string) => void;
}

export const VideoTranscriptEditor: React.FC<VideoTranscriptEditorProps> = ({ segment, onTranscriptChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [deletedWords, setDeletedWords] = useState<Set<number>>(new Set());

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    video.addEventListener('timeupdate', updateTime);
    return () => video.removeEventListener('timeupdate', updateTime);
  }, []);

  const toggleWordDeletion = (index: number) => {
    setDeletedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
    
    // Update transcript
    const newTranscript = segment.words
      .filter((_, i) => !deletedWords.has(i))
      .map(word => word.word)
      .join(' ');
    onTranscriptChange(newTranscript);
  };

  const isWordActive = (word: typeof segment.words[0]) => {
    return currentTime >= word.start_time && currentTime <= word.end_time;
  };

  return (
    <div className="video-transcript-editor">
      <div className="video-container">
        <video 
          ref={videoRef} 
          src={segment.videoSegmentLocation} 
          controls
        />
        {/* Red overlay logic here */}
      </div>
      <div className="transcript">
        {segment.words.map((wordGroup, index) => (
          <span 
            key={index}
            className={`
              word 
              ${isWordActive(wordGroup) ? 'active' : ''}
              ${deletedWords.has(index) ? 'deleted' : ''}
            `}
            onClick={() => toggleWordDeletion(index)}
          >
            {wordGroup.word}
          </span>
        ))}
      </div>
    </div>
  );
};