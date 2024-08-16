import React, { useEffect, useRef, useState } from "react";
import { Logs, Short } from "../../types/collections/Shorts";
import { Segment } from "../../types/collections/Segment";
import FirebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import { useNotification } from "../../contexts/NotificationProvider";
import { Timestamp } from "firebase/firestore";
import { AudioPlayer } from "../audio/AudioPlayer";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import {useShortRequestManagement} from "../../contexts/ShortRequestProvider";

export interface TranscriptEditorTabProps {
  short: Short;
  segment: Segment;
  shortId: string;
}

export interface EditedTranscriptProps {
  transcript: string;
  operations: Logs[];
  editing: boolean;
  deleteRange: DeleteRange;
  setDeleteRange: React.Dispatch<React.SetStateAction<DeleteRange>>;
}

export interface TranscriptWord {
  word: string;
  status: "none" | "deleted" | "selected" | "undeleted";
}

type DeleteRange = {
  startIndex: number | undefined;
  endIndex: number | undefined;
};

export const EditedTranscript: React.FC<EditedTranscriptProps> = ({
                                                                    transcript,
                                                                    operations,
                                                                    editing,
                                                                    deleteRange,
                                                                    setDeleteRange,
                                                                  }) => {
  const [transcriptWords, setTranscriptWords] = useState<TranscriptWord[]>([]);

  useEffect(() => {
    const transcriptWord: TranscriptWord[] = transcript.split(" ").map((elem) => ({ word: elem, status: "none" }));

    for (let operation of operations) {
      if (operation.type === "delete") {
        for (let i = operation.start_index; i <= operation.end_index; i++) {
          if (transcriptWord[i]) {
            transcriptWord[i].status = 'deleted';
          }
        }
      }
      if (operation.type === "undelete") {
        for (let i = operation.start_index; i <= operation.end_index; i++) {
          if (transcriptWord[i]) {
            transcriptWord[i].status = 'undeleted';
          }
        }
      }
    }

    if (deleteRange.startIndex !== undefined && deleteRange.endIndex !== undefined) {
      for (let i = deleteRange.startIndex; i <= deleteRange.endIndex; i++) {
        if (transcriptWord[i]) {
          transcriptWord[i].status = 'selected';
        }
      }
    } else if (deleteRange.startIndex !== undefined) {
      if (transcriptWord[deleteRange.startIndex]) {
        transcriptWord[deleteRange.startIndex].status = 'selected';
      }
    }

    setTranscriptWords(transcriptWord);
  }, [transcript, operations, deleteRange]);

  const buttonPress = (index: number) => {
    setDeleteRange((prevState) => {
      if (prevState.startIndex !== undefined) {
        if (prevState.endIndex !== undefined) {
          return { startIndex: undefined, endIndex: undefined };
        } else {
          if (index >= prevState.startIndex) {
            return { ...prevState, endIndex: index };
          } else {
            return { startIndex: index, endIndex: prevState.startIndex };
          }
        }
      } else {
        return { ...prevState, startIndex: index };
      }
    });
  };

  return (
    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
      <div className="flex flex-wrap gap-1 my-2">
        {transcriptWords.map((elem, index) => (
          <Button
            key={index}
            onClick={() => buttonPress(index)}
            disabled={!editing}
            variant="ghost"
            size="sm"
            className={`
              ${elem.status === "none" ? "text-white bg-gray-800" : ""}
              ${elem.status === "deleted" ? "text-white bg-red-900" : ""}
              ${elem.status === "undeleted" ? "text-white bg-green-800" : ""}
              ${elem.status === "selected" ? "text-white bg-blue-900" : ""}
              p-[2px] px-[5px] rounded border-gray-500 border font-light text-sm
            `}
          >
            {elem.word}
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};

export const TranscriptEditorTab: React.FC<TranscriptEditorTabProps> = ({ short, segment, shortId }) => {
  const scrollRef = useRef<HTMLOListElement>(null);
  const [editing, setEditing] = useState(false);
  const [deleteRange, setDeleteRange] = useState<DeleteRange>({ startIndex: undefined, endIndex: undefined });
  const { showNotification } = useNotification();
  const { createShortRequest } = useShortRequestManagement();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const addDeleteOperation = (deleteRange: DeleteRange) => {
    if (deleteRange.startIndex !== undefined && deleteRange.endIndex !== undefined) {
      const newLogs: Logs[] = [...short.logs, {
        type: "delete",
        start_index: deleteRange.startIndex,
        end_index: deleteRange.endIndex,
        message: `User Manual Delete Between (${deleteRange.startIndex}-${deleteRange.endIndex})`,
        time: Timestamp.now()
      }];

      FirebaseFirestoreService.updateDocument(
        "shorts",
        shortId,
        { "logs": newLogs },
        () => {
          showNotification("Updated operation", "Added new operation", "success");
          setDeleteRange({ startIndex: undefined, endIndex: undefined });
        },
        (error) => {
          showNotification("Failed Update", "Failed to update document", "error");
          setDeleteRange({ startIndex: undefined, endIndex: undefined });
        }
      );
    }
  };

  const addUnDeleteOperation = (deleteRange: DeleteRange) => {
    if (deleteRange.startIndex !== undefined && deleteRange.endIndex !== undefined) {
      const newLogs: Logs[] = [...short.logs, {
        type: "undelete",
        start_index: deleteRange.startIndex,
        end_index: deleteRange.endIndex,
        message: `User Manual undelete Between (${deleteRange.startIndex}-${deleteRange.endIndex})`,
        time: Timestamp.now()
      }];

      FirebaseFirestoreService.updateDocument(
        "shorts",
        shortId,
        { "logs": newLogs },
        () => {
          showNotification("Updated operation", "Added new operation", "success");
          setDeleteRange({ startIndex: undefined, endIndex: undefined });
        },
        (error) => {
          showNotification("Failed Update", "Failed to update document", "error");
          setDeleteRange({ startIndex: undefined, endIndex: undefined });
        }
      );
    }
  };

  const removeLastOperation = () => {
    const newLogs: Logs[] = short.logs.slice(0, -1);
    FirebaseFirestoreService.updateDocument(
      "shorts",
      shortId,
      { "logs": newLogs },
      () => {
        showNotification("Updated operation", "Removed last operation", "success");
        setDeleteRange({ startIndex: undefined, endIndex: undefined });
      },
      (error) => {
        showNotification("Failed Update", "Failed to remove last operation", "error");
        setDeleteRange({ startIndex: undefined, endIndex: undefined });
      }
    );
  };

  const requestAIGeneration = () => {
    createShortRequest(
      shortId,
      "v1/temporal-segmentation",
      (requestId) => {
        showNotification("AI Transcript Editing", `Request ID: ${requestId}`, "success");
      },
      (error) => {
        showNotification("AI Transcript Editing Failed", `${error}`, "error");
      }
    );
  };

  const requestSoundPreview = () => {
    createShortRequest(
      shortId,
      "v1/generate-test-audio",
      (requestId) => {
        showNotification("Generate Test Audio", `Request ID: ${requestId}`, "success");
      },
      (error) => {
        showNotification("Generate Test Audio Failed", `${error}`, "error");
      }
    );
  };

  return (
    <div className="w-full">
      <CardContent>
        <Tabs defaultValue="transcript" className="w-full">
          <div className="flex w-full justify-between flex-wrap gap-2">
            <TabsList>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
            <div className="flex gap-2 flex-wrap ">
              <Button
                onClick={requestAIGeneration}
                variant="default"
                className="!bg-primary text-purple-900 "
              >
                AI Generation
              </Button>
              <Button
                onClick={requestSoundPreview}
                variant="secondary"
              >
                Preview Sound
              </Button>
              <Button
                onClick={() => setEditing(!editing)}
                variant={editing ? "destructive" : "default"}
              >
                {editing ? "Quit Editing" : "Edit Transcript"}
              </Button>
            </div>
          </div>
          <TabsContent value="transcript">
            {short.temp_audio_file && short.temp_audio_file !== "Loading..." && (
              <div className="mb-4">
                <p className="font-bold text-white mb-2">Preview Audio</p>
                <AudioPlayer path={short.temp_audio_file} />
              </div>
            )}
            <p className="font-bold text-white mb-2">Output Transcript</p>
            {editing && <p className="mb-2">Pick a start and an end position then press confirm.</p>}
            <EditedTranscript
              transcript={short.transcript}
              operations={short.logs}
              editing={editing}
              deleteRange={deleteRange}
              setDeleteRange={setDeleteRange}
            />
            {editing && (
              <div className="flex justify-between mt-4">
                <Button onClick={() => addDeleteOperation(deleteRange)} disabled={!deleteRange.startIndex || !deleteRange.endIndex}>
                  Delete Selected Range
                </Button>
                <Button onClick={() => addUnDeleteOperation(deleteRange)} disabled={!deleteRange.startIndex || !deleteRange.endIndex}>
                  UnDelete Selected Range
                </Button>
                <Button onClick={removeLastOperation} disabled={short.logs.length === 0}>
                  Remove Last Operation
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="timeline">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              {short.logs.slice().reverse().map((value, index) => (
                <Card key={index} className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-sm">
                      {value.type === "message" && "Server Message"}
                      {value.type === "error" && "Error Message"}
                      {value.type === "success" && "Success!"}
                      {(value.type === "delete" || value.type === "undelete") && "Editing"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{value.message}</p>
                    {value.time && <p className="text-sm text-muted-foreground">{value.time.toDate().toLocaleString()}</p>}
                    {(value.type === "delete" || value.type === "undelete") && (
                      <div className="flex flex-wrap gap-1 my-2">
                        {short.transcript.split(" ").map((elem, wordIndex) => (
                          <span
                            key={wordIndex}
                            className={`
                              text-white p-[2px] px-[5px] rounded font-light text-sm
                              ${wordIndex < value.start_index || wordIndex > value.end_index
                              ? "bg-gray-900 border-gray-500 border"
                              : value.type === "delete"
                                ? "bg-red-950"
                                : "bg-green-950"
                            }
                            `}
                          >
                            {elem}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </div>
  );
};