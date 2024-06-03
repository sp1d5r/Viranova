import React, { useEffect, useState } from 'react';
import { Timestamp } from "firebase/firestore";
import { Logs } from "../../../types/collections/Shorts";

export interface EditTranscriptProps {
  editing: boolean;
  initialTranscript: string;
  operations: Logs[];
  selectedRange?: { startIndex: number, endIndex?: number };
}

export interface TranscriptWord {
  word: string;
  status: 'none' | 'deleted' | 'selected';
}

const EditTranscript: React.FC<EditTranscriptProps> = ({
                                                         editing,
                                                         initialTranscript,
                                                         operations,
                                                         selectedRange
                                                       }) => {
  const [transcriptWords, setTranscriptWords] = useState<TranscriptWord[]>([]);

  useEffect(() => {
    const words = initialTranscript.split(" ").map((word) => ({ word, status: "none" } as TranscriptWord));
    setTranscriptWords(words);
  }, [initialTranscript]);

  useEffect(() => {
    const newWords = transcriptWords.map((word, i) => {
      let newStatus = word.status;
      // Apply operations
      operations.forEach(operation => {
        if (operation.type === "delete" && i >= operation.start_index && i <= operation.end_index) {
          newStatus = 'deleted';
        }
        if (operation.type === "undelete" && i >= operation.start_index && i <= operation.end_index) {
          newStatus = 'none';
        }
      });

      // Apply selection range if applicable
      if (selectedRange) {
        if (selectedRange.endIndex !== undefined) {
          if (i >= selectedRange.startIndex && i <= selectedRange.endIndex) {
            newStatus = 'selected';
          }
        } else if (i === selectedRange.startIndex) {
          newStatus = 'selected';
        }
      }

      return { ...word, status: newStatus };
    });

    setTranscriptWords(newWords);
  }, [operations, selectedRange]);

  const handleWordToggle = (index: number) => {
    const newWords = transcriptWords.map((word, i) => {
      if (i === index) {
        const newStatus = word.status === 'none' ? 'deleted' : 'none';
        const newOperation: Logs = {
          type: newStatus === 'deleted' ? 'delete' : 'undelete',
          start_index: index,
          end_index: index,
          time: Timestamp.now(),
          message: `User toggled deletion at index ${index}`
        };
        // updateOperations((prevOperations) => {
        //   return [...prevOperations, newOperation]
        // });
        return { ...word, status: newStatus } as TranscriptWord;
      }
      return word;
    });
    setTranscriptWords(newWords);
  };

  return (
    <div className="transcript-editor">
      {transcriptWords.map((word, index) => (
        <button
          key={index}
          disabled={!editing}
          className={`inline-block m-1 px-2 py-1 rounded ${word.status === 'deleted' ? 'bg-red-500 text-white' : word.status === 'selected' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'} hover:bg-gray-300`}
          onClick={() => handleWordToggle(index)}
        >
          {word.word}
        </button>
      ))}
    </div>
  );
};

export default EditTranscript;