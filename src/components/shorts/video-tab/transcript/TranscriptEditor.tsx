import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Short, Logs } from "../../../../types/collections/Shorts";
import { Segment } from "../../../../types/collections/Segment";
import { FirebaseStorageService } from "../../../../services/storage/strategies";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { Slider } from "../../../ui/slider";
import {Crosshair, Terminal} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "../../../ui/alert";
import {LoadingSpinner} from "@tremor/react/dist/assets";
import {IconTruckLoading} from "@tabler/icons-react";

interface TranscriptEditorProps {
  short: Short;
  shortId: string;
  segment: Segment;
}

interface Word {
  word: string;
  start_time: number;
  end_time: number;
  isKept?: boolean;
  color?: string;
}

interface Line {
  words: Word[];
  y_position: number;
}

export const TranscriptEditor: React.FC<TranscriptEditorProps> = ({ short, shortId, segment }) => {
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [lines, setLines] = useState<Line[]>([]);
  const [currentLine, setCurrentLine] = useState<Line | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [colorScheme, setColorScheme] = useState("#1FFF01");
  const [wordColor, setWordColor] = useState("#FFFFFF");
  const bRollRef = useRef<HTMLVideoElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (short.short_b_roll && !videoUrl) {
      loadVideo(short.short_b_roll).then(url => setVideoUrl(url));
    }
  }, [short.short_b_roll]);

  useEffect(() => {
    const initialWords = adjustTimestamps(handleOperationsFromLogs(short.logs, segment.words.map((word) => {
      return {
        ...word,
        isKept:false,
      } as Word
    })));
    const initialLines = generateInitialLines(initialWords);
    setLines(initialLines);
    setCurrentLine(initialLines[0] || null);
  }, [segment.words, short.logs]);

  const handleOperationsFromLogs = (logs: Logs[], words: Word[]): Word[] => {
    const updatedWords = words.map(word => ({ ...word, isKept: true }));
    logs.forEach((log) => {
      if (log.type === "delete") {
        for (let i = log.start_index; i <= log.end_index; i++) {
          if (i < updatedWords.length) {
            updatedWords[i].isKept = false;
          }
        }
      } else if (log.type === "undelete") {
        for (let i = log.start_index; i <= log.end_index; i++) {
          if (i < updatedWords.length) {
            updatedWords[i].isKept = true;
          }
        }
      }
    });
    return updatedWords.filter(word => word.isKept);
  };

  const adjustTimestamps = (words: Word[]): Word[] => {
    if (words.length === 0) return [];

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

    const firstWordStartTime = adjustedWords[0].start_time;
    return adjustedWords.map((word) => ({
      ...word,
      start_time: word.start_time - firstWordStartTime,
      end_time: word.end_time - firstWordStartTime,
    }));
  };

  const generateInitialLines = (words: Word[]): Line[] => {
    const lines: Line[] = [];
    let currentLine: Word[] = [];
    words.forEach((word, index) => {
      currentLine.push(word);
      if (currentLine.length === 3 || index === words.length - 1) {
        lines.push({ words: currentLine, y_position: 240 });
        currentLine = [];
      }
    });
    return lines;
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

  const handleWordClick = (word: Word) => {
    setSelectedWord(word);
  };

  const handleIsolateWord = () => {
    if (selectedWord && currentLine) {
      const updatedLines = lines.map(line =>
        line === currentLine
          ? { ...line, words: [selectedWord] }
          : line
      );
      setLines(updatedLines);
    }
  };

  const handleSplitLine = () => {
    if (selectedWord && currentLine) {
      const wordIndex = currentLine.words.indexOf(selectedWord);
      if (wordIndex > -1) {
        const newLines = lines.flatMap(line =>
          line === currentLine
            ? [
              { words: line.words.slice(0, wordIndex + 1), y_position: line.y_position },
              { words: line.words.slice(wordIndex + 1), y_position: line.y_position + 40 }
            ]
            : [line]
        );
        setLines(newLines);
      }
    }
  };

  const handleYPositionChange = (value: number) => {
    if (currentLine) {
      const updatedLines = lines.map(line =>
        line === currentLine ? { ...line, y_position: value } : line
      );
      setLines(updatedLines);
    }
  };

  const navigateTranscript = (line: Line) => {
    if (bRollRef.current) {
      bRollRef.current.currentTime = line.words[0].start_time;
    }
  };

  const updateCurrentLine = useCallback(() => {
    if (bRollRef.current) {
      const videoTime = bRollRef.current.currentTime;
      setCurrentTime(videoTime);

      const newCurrentLineIndex = lines.findIndex(line => {
        const lineStartTime = line.words[0].start_time;
        const lineEndTime = line.words[line.words.length - 1].end_time;
        return lineStartTime <= videoTime && videoTime < lineEndTime;
      });

      if (newCurrentLineIndex !== -1 && lines[newCurrentLineIndex] !== currentLine) {
        setCurrentLine(lines[newCurrentLineIndex]);

        // Scroll to the current line within the div
        if (transcriptRef.current) {
          const lineElement = document.getElementById(`line-${newCurrentLineIndex}`);
          if (lineElement) {
            const containerRect = transcriptRef.current.getBoundingClientRect();
            const lineRect = lineElement.getBoundingClientRect();
            const relativeTop = lineRect.top - containerRect.top;
            const centerPosition = relativeTop - containerRect.height / 2 + lineRect.height / 2;

            transcriptRef.current.scrollTop += centerPosition;
          }
        }
      }
    }
  }, [lines, currentLine, bRollRef.current]);

  useEffect(() => {
    const videoElement = bRollRef.current;
    if (videoElement) {
      videoElement.addEventListener('timeupdate', updateCurrentLine);
      return () => {
        videoElement.removeEventListener('timeupdate', updateCurrentLine);
      };
    }
  }, [updateCurrentLine]);

  return (
    <div className="w-full flex flex-col gap-4 text-white p-4">
      <Alert>
        <Crosshair className="h-4 w-4" />
        <AlertTitle>Feature is Pending</AlertTitle>
        <AlertDescription>
          I know this feature looks cool - I know you want to get started. But it's not ready. Test it out and give feedback here {' '}
          <a className="text-primary underline" href="mailto:elijahahmad03@gmail.com">elijahahmad03@gmail.com</a>.
        </AlertDescription>
      </Alert>
      <div className="w-full flex">
        <div className="w-1/2">
          <h2 className="text-2xl font-bold mb-4">Edit Transcript</h2>
          <p>Press a word in the video to select it. </p>
          <div className="relative w-[270px] h-[480px] bg-gray-800 flex justify-center items-center">
            {videoUrl ? (
              <video ref={bRollRef} className="w-full h-full" controls>
                <source src={videoUrl} type="video/mp4" />
              </video>
            ) : (
              <div className="flex flex-col justify-start items-start h-[60%] font-bold gap-2">
                <IconTruckLoading />
                <p>Video Here<br />Same as before</p>
              </div>
            )}
            {currentLine && (
              <div
                className="absolute z-10 text-center w-full"
                style={{ top: `${currentLine.y_position}px` }}
              >
                {currentLine.words.map((word, index) => (
                  <span
                    key={index}
                    className="font-bold mx-1 cursor-pointer"
                    style={{ color: word === selectedWord ? wordColor : colorScheme }}
                    onClick={() => handleWordClick(word)}
                  >
                  {word.word}
                </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="w-1/2">
          <h3 className="text-xl font-semibold mb-2">Transcription Settings</h3>
          <div className="mb-4">
            <label className="block mb-1">Colour Scheme:</label>
            <div className="flex items-center">
              <Input
                type="color"
                value={colorScheme}
                onChange={(e) => setColorScheme(e.target.value)}
                className="w-8 h-8 p-0 mr-2"
              />
              <span>{colorScheme}</span>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Word Settings</h3>
          <div className="mb-4">
            <label className="block mb-1">Selected Word:</label>
            <div className="bg-gray-700 p-2 rounded">{selectedWord?.word || 'None'}</div>
          </div>
          <div className="mb-4">
            <label className="block mb-1">Word Colour:</label>
            <div className="flex items-center">
              <Input
                type="color"
                value={wordColor}
                onChange={(e) => setWordColor(e.target.value)}
                className="w-8 h-8 p-0 mr-2"
              />
              <span>{wordColor}</span>
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            <Button onClick={handleIsolateWord}>Isolate Word</Button>
            <Button onClick={handleSplitLine}>Split Line (After)</Button>
          </div>
          <h3 className="text-xl font-semibold mb-2">Line Settings</h3>
          <div className="mb-4">
            <label className="block mb-1">Current Line:</label>
            <div className="bg-gray-700 p-2 rounded">
              {currentLine?.words.map(w => w.word).join(' ') || 'None'}
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-1">Y-Position:</label>
            <Slider
              value={[currentLine?.y_position || 0]}
              onValueChange={(value) => handleYPositionChange(value[0])}
              max={480}
              step={1}
            />
          </div>
        </div>
      </div>
      <div>
      <h3 className="text-xl font-semibold mb-2">Navigate Transcript</h3>
      <div className="space-y-2 h-[300px] overflow-y-auto" ref={transcriptRef}>
        {lines.map((line, index) => {
          const isPastLine = currentTime > line.words[line.words.length - 1].end_time;
          const isCurrentLine = line === currentLine;
          return (
            <div
              id={`line-${index}`}
              key={index}
              className={`flex justify-between cursor-pointer p-2 rounded ${
                isCurrentLine ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
              onClick={() => navigateTranscript(line)}
              style={{
                color: isPastLine ? '#666' : (isCurrentLine ? colorScheme : 'white'),
                opacity: isPastLine ? 0.7 : 1,
              }}
            >
              <span>{line.words.map(w => w.word).join(' ')}</span>
              <span>{`${line.words[0].start_time.toFixed(2)} - ${line.words[line.words.length - 1].end_time.toFixed(2)}`}</span>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
};