import React, { useEffect, useRef, useState } from 'react';
import { Short, Line, Word } from "../../../../types/collections/Shorts";
import { Segment } from "../../../../types/collections/Segment";
import { FirebaseStorageService } from "../../../../services/storage/strategies";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { Slider } from "../../../ui/slider";
import { Crosshair } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../../ui/alert";
import { IconTruckLoading } from "@tabler/icons-react";
import FirebaseFirestoreService from "../../../../services/database/strategies/FirebaseFirestoreService";

interface TranscriptEditorProps {
  short: Short;
  shortId: string;
  segment: Segment;
}

export const TranscriptEditor: React.FC<TranscriptEditorProps> = ({ short, shortId, segment }) => {
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [lines, setLines] = useState<Line[]>([]);
  const [currentLine, setCurrentLine] = useState<Line | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [colorScheme, setColorScheme] = useState("#1FFF01");
  const [editedWords, setEditedWords] = useState<Word[]>([]);
  const bRollRef = useRef<HTMLVideoElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (short.short_b_roll && !videoUrl) {
      loadVideo(short.short_b_roll).then(url => setVideoUrl(url));
    } else if (short.short_a_roll && !videoUrl) {
      loadVideo(short.short_a_roll).then(url => setVideoUrl(url));
    }
  }, [short.short_b_roll, short.short_a_roll, videoUrl]);

  useEffect(() => {
    if (!short.lines) {
      const initialWords = adjustTimestamps(handleOperationsFromLogs(short.logs, segment.words.map((word) => ({
        ...word,
        isKept: true,
        color: short.defaultWordColor || "#FFFFFF"
      }))));
      const initialLines = generateInitialLines(initialWords);
      setLines(initialLines);
      setCurrentLine(initialLines[0] || null);
    } else {
      setLines(short.lines);
      setCurrentLine(short.lines[0] || null);
    }
  }, [segment.words, short.logs, short.lines, short.defaultWordColor]);

  useEffect(() => {
    if (currentLine) {
      setEditedWords(currentLine.words);
    }
  }, [currentLine]);

  const handleOperationsFromLogs = (logs: any[], words: Word[]): Word[] => {
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

  const updateFirebaseLines = async (updatedLines: Line[]) => {
    try {
      await FirebaseFirestoreService.updateDocument("shorts", shortId, { lines: updatedLines });
    } catch (error) {
      console.error("Failed to update lines in Firebase:", error);
    }
  };

  const handleWordChange = (index: number, newWord: string) => {
    if (currentLine) {
      const updatedWords = [...editedWords];
      const oldWord = updatedWords[index];
      const wordDuration = oldWord.end_time - oldWord.start_time;
      const newWordDuration = (newWord.length / oldWord.word.length) * wordDuration;

      updatedWords[index] = {
        ...oldWord,
        word: newWord,
        end_time: oldWord.start_time + newWordDuration
      };

      // Adjust timestamps for subsequent words
      for (let i = index + 1; i < updatedWords.length; i++) {
        updatedWords[i] = {
          ...updatedWords[i],
          start_time: updatedWords[i-1].end_time,
          end_time: updatedWords[i-1].end_time + (updatedWords[i].end_time - updatedWords[i].start_time)
        };
      }

      setEditedWords(updatedWords);
    }
  };

  const handleWordColorChange = (index: number, color: string) => {
    if (currentLine) {
      const updatedWords = [...editedWords];
      updatedWords[index] = { ...updatedWords[index], color: color };
      setEditedWords(updatedWords);
    }
  };

  const handleLineColorChange = (color: string) => {
    setColorScheme(color);
    if (currentLine) {
      const updatedLines = lines.map(line =>
        line === currentLine ? { ...line, color: color } : line
      );
      setLines(updatedLines);
      updateFirebaseLines(updatedLines);
    }
  };

  const handleYPositionChange = (value: number) => {
    if (currentLine) {
      const yPosition = (value / 100) - 0.5;
      const updatedLines = lines.map(line =>
        line === currentLine ? { ...line, y_position: yPosition } : line
      );
      setLines(updatedLines);
      updateFirebaseLines(updatedLines);
    }
  };

  const updateCurrentLine = () => {
    if (currentLine) {
      const updatedLines = lines.map(line =>
        line === currentLine ? { ...line, words: editedWords } : line
      );
      setLines(updatedLines);
      updateFirebaseLines(updatedLines);
    }
  };

  const navigateTranscript = (line: Line) => {
    if (bRollRef.current) {
      bRollRef.current.currentTime = line.words[0].start_time;
    }
  };

  const updateCurrentLineFromVideoTime = () => {
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
  };

  useEffect(() => {
    const videoElement = bRollRef.current;
    if (videoElement) {
      videoElement.addEventListener('timeupdate', updateCurrentLineFromVideoTime);
      return () => {
        videoElement.removeEventListener('timeupdate', updateCurrentLineFromVideoTime);
      };
    }
  }, [lines, currentLine, bRollRef.current]);

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
                style={{ top: `${(currentLine.y_position + 0.5) * 100}%` }}
              >
                {currentLine.words.map((word, index) => (
                  <span
                    key={index}
                    className="font-bold mx-1 cursor-pointer"
                    style={{ color: word.color || currentLine.color || colorScheme }}
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
            <label className="block mb-1">Line Colour:</label>
            <div className="flex items-center">
              <Input
                type="color"
                value={colorScheme}
                onChange={(e) => handleLineColorChange(e.target.value)}
                className="w-8 h-8 p-0 mr-2"
              />
              <span>{colorScheme}</span>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Current Line Words</h3>
          {editedWords.map((word, index) => (
            <div key={index} className="mb-4 flex items-center gap-2">
              <Input
                value={word.word}
                onChange={(e) => handleWordChange(index, e.target.value)}
                className="flex-grow"
              />
              <Input
                type="color"
                value={word.color || colorScheme}
                onChange={(e) => handleWordColorChange(index, e.target.value)}
                className="w-8 h-8 p-0"
              />
              <span>{word.start_time.toFixed(2)} - {word.end_time.toFixed(2)}</span>
            </div>
          ))}
          <Button onClick={updateCurrentLine}>Update Line</Button>
          <h3 className="text-xl font-semibold mb-2 mt-4">Line Settings</h3>
          <div className="mb-4">
            <label className="block mb-1">Y-Position:</label>
            <Slider
              value={[currentLine ? (currentLine.y_position + 0.5) * 100 : 50]}
              onValueChange={(value) => handleYPositionChange(value[0])}
              max={100}
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