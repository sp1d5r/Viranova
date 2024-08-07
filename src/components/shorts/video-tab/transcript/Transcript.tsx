import React, { useEffect, useRef, useState } from 'react';
import { Short, Logs } from "../../../../types/collections/Shorts";
import { Segment } from "../../../../types/collections/Segment";
import { FirebaseStorageService } from "../../../../services/storage/strategies";

export interface TranscriptProps {
  short: Short;
  shortId: string;
  segment: Segment;
}

interface Word {
  word: string;
  start_time: number;
  end_time: number;
  isKept: boolean;
  fontSize?: number;
  color?: string;
}

interface Line {
  words: Word[];
  fontSize?: number;
  position?: { x: number; y: number };
}

export const TranscriptTab: React.FC<TranscriptProps> = ({ short, shortId, segment }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [fps, setFps] = useState(30);
  const bRollRef = useRef<HTMLVideoElement>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [currentLine, setCurrentLine] = useState<Line | null>(null);

  useEffect(() => {
    const handleTimeUpdate = () => {
      if (bRollRef.current) {
        const newTime = bRollRef.current.currentTime;
        setCurrentTime(newTime);
        updateCurrentLine(newTime);
        console.log(newTime);
      }
    };

    const videoElement = bRollRef.current;
    videoElement?.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      videoElement?.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [fps, lines, bRollRef.current]);

  useEffect(() => {
    if (fps !== short.fps) {
      setFps(short.fps);
    }
  }, [short.fps]);

  useEffect(() => {
    const initialWords: Word[] = segment.words.map((word) => ({
      ...word,
      start_time: word.start_time - segment.earliestStartTime,
      end_time: word.end_time - segment.earliestStartTime,
      isKept: true,
      fontSize: 20,
      color: 'white',
    }));

    if (short.logs && initialWords.length > 0) {
      const updatedWords = handleOperationsFromLogs(short.logs, initialWords);
      const adjustedWords = adjustTimestamps(updatedWords);
      setWords(adjustedWords);
      generateLines(adjustedWords);
    }
  }, [short.logs, segment.words, segment.earliestStartTime]);

  const handleOperationsFromLogs = (logs: Logs[], words: Word[]): Word[] => {
    logs.forEach((log) => {
      if (log.type === "delete") {
        for (let i = log.start_index; i <= log.end_index; i++) {
          if (i < words.length) {
            words[i].isKept = false;
          }
        }
      } else if (log.type === "undelete") {
        for (let i = log.start_index; i <= log.end_index; i++) {
          if (i < words.length) {
            words[i].isKept = true;
          }
        }
      }
    });
    return words.filter(word => word.isKept);
  };

  const mergeConsecutiveCuts = (words: Word[]): [number, number][] => {
    const cuts: [number, number][] = [];
    let currentCut: [number, number] | null = null;

    words.forEach((word) => {
      if (!currentCut) {
        currentCut = [word.start_time, word.end_time];
      } else if (word.start_time <= currentCut[1]) {
        currentCut[1] = Math.max(currentCut[1], word.end_time);
      } else {
        cuts.push(currentCut);
        currentCut = [word.start_time, word.end_time];
      }
    });

    if (currentCut) {
      cuts.push(currentCut);
    }

    return cuts;
  };

  const adjustTimestamps = (words: Word[]): Word[] => {
    let cumulativeOffset = 0;
    let previousEndTime = words[0].start_time;

    const adjustedWords = words.map((word) => {
      const gap = word.start_time - previousEndTime;
      if (gap > 0) {
        cumulativeOffset += gap;
      }

      const adjustedWord = { ...word };
      adjustedWord.start_time = Math.max(0, word.start_time - cumulativeOffset);
      adjustedWord.end_time = Math.max(0, word.end_time - cumulativeOffset);

      previousEndTime = word.end_time;

      return adjustedWord;
    });
    return adjustedWords.map((word) => {
      const fixedWord = {...word}
      fixedWord.start_time -= words[0].start_time;
      fixedWord.end_time -= words[0].start_time;
      return fixedWord;
    })
  };

  const generateLines = (words: Word[]) => {
    const newLines: Line[] = [];
    let previouscurrentLine: Line = { words: [], fontSize: 24, position: { x: 10, y:  240 } };

    words.forEach((word, index) => {
      previouscurrentLine.words.push(word);
      if (previouscurrentLine.words.length === 3 || index === words.length - 1) {
        newLines.push(previouscurrentLine);
        previouscurrentLine = { words: [], fontSize: 24, position: { x: 10, y: 240 } };
      }
    });
    setLines(newLines);
  };

  const updateCurrentLine = (time: number) => {
    const newCurrentLine = lines.find(line => {
      const lineStartTime = line.words[0].start_time;
      const lineEndTime = line.words[line.words.length - 1].end_time;
      return lineStartTime <= time  && time <= lineEndTime;
    });
    console.log(time, newCurrentLine);
    setCurrentLine(newCurrentLine || null);
  };

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
    if (short.short_b_roll && !videoUrl) {
      loadVideo(short.short_b_roll).then(url =>
        setVideoUrl(url)
      );
    }
  }, [short.short_b_roll]);

  const Words: React.FC<{ line: Line | null }> = ({ line }) => {
    if (!line) return null;

    return (
      <div
        className="absolute z-50 m-auto"
        style={{
          top: `${line.position?.y}px`,
          fontSize: `${line.fontSize}px`,
        }}
      >
        {line.words.map((word, index) => (
          <span
            key={index}
            style={{
              fontSize: `${word.fontSize || line.fontSize}px`,
              color: word.color || 'white',
              marginRight: '5px',
            }}
            className="font-bold font-montserrat outline-text"
          >
            {word.word}
          </span>
        ))}
      </div>
    );
  };

  const LineSettings: React.FC<{ line: Line, index: number }> = ({ line, index }) => {
    const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newLines = [...lines];
      newLines[index].fontSize = Number(e.target.value);
      setLines(newLines);
    };

    const handlePositionChange = (axis: 'x' | 'y', value: number) => {
      const newLines = [...lines];
      if (newLines[index].position) {
        newLines[index].position![axis] = value;
        setLines(newLines);
      }
    };

    return (
      <div className="mb-4 p-2 border rounded">
        <h3 className="text-lg font-semibold mb-2">Line {index + 1}</h3>
        <p>Start Time: {line.words[0].start_time}</p>
        <p>End Time: {line.words[line.words.length - 1].start_time}</p>
        <div className="flex items-center mb-2">
          <label className="mr-2">Font Size:</label>
          <input
            type="number"
            value={line.fontSize}
            onChange={handleFontSizeChange}
            className="w-16 px-1 py-0.5 text-black"
          />
        </div>
        <div className="flex items-center mb-2">
          <label className="mr-2">X Position:</label>
          <input
            type="number"
            value={line.position?.x}
            onChange={(e) => handlePositionChange('x', Number(e.target.value))}
            className="w-16 px-1 py-0.5 text-black"
          />
        </div>
        <div className="flex items-center">
          <label className="mr-2">Y Position:</label>
          <input
            type="number"
            value={line.position?.y}
            onChange={(e) => handlePositionChange('y', Number(e.target.value))}
            className="w-16 px-1 py-0.5 text-black"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {line.words.map((word) => {
            return <p>{word.word}</p>
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex gap-2 items-start justify-center">
      {/* Video Player */}
      <div className="relative w-[270px] h-[480px] flex justify-center">
        {videoUrl ? (
          <video ref={bRollRef} className="z-10 h-full w-full" controls>
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <p>Video Will Play Here</p>
        )}
        <Words line={currentLine} />
      </div>
      <div className="flex-1 min-h-[480px] bg-zinc-950 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-white">Edit Transcript</h2>
        {lines.map((line, index) => (
          <LineSettings key={index} line={line} index={index} />
        ))}
      </div>
    </div>
  );
};