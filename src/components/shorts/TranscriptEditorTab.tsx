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
import {Popover, PopoverContent, PopoverTrigger} from "../ui/popover";
import {ChevronLeft, ChevronRight, Sparkles} from "lucide-react";
import {Textarea} from "../ui/textarea";
import {Input} from "../ui/input";
import {CreditButton} from "../ui/credit-button";
import VideoTranscriptPlayer from "../video-player/VideoTranscriptPlayer";

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedRange, setSelectedRange] = useState<DeleteRange>({ startIndex: undefined, endIndex: undefined });
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // Scroll to selected word when selection changes
  useEffect(() => {
    if (selectedRange.startIndex !== undefined && transcriptContainerRef.current) {
      // Find the selected word element
      const wordElement = transcriptContainerRef.current.querySelector(`[data-word-index="${selectedRange.startIndex}"]`);
      if (wordElement) {
        wordElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedRange]);

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
      1,
      (requestId) => {
        showNotification("AI Transcript Editing", `Request ID: ${requestId}`, "success");
      },
      (error) => {
        showNotification("AI Transcript Editing Failed", `${error}`, "error");
      }
    );
  };

  const requestAIGenerationV2 = () => {
    createShortRequest(
      shortId,
      "v2/temporal-segmentation",
      1,
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
      1,
      (requestId) => {
        showNotification("Generate Test Audio", `Request ID: ${requestId}`, "success");
      },
      (error) => {
        showNotification("Generate Test Audio Failed", `${error}`, "error");
      }
    );
  };

  const [contextTranscript, setContextTranscript] = useState(short.context_transcript || "");

  const updateContextTranscript = () => {
    if (contextTranscript.split(' ').length > 20) {
      showNotification("Error", "Context must be 20 words or less", "error");
      return;
    }

    FirebaseFirestoreService.updateDocument(
      "shorts",
      shortId,
      { "context_transcript": contextTranscript },
      () => {
        showNotification("Updated Context", "Context transcript updated successfully", "success");
        createShortRequest(
          shortId,
          "v1/generate-intro",
          2,
          (requestId) => {
            showNotification("Create Short Intro", `Request ID: ${requestId}`, "success");
          },
          (error) => {
            showNotification("Create Short Intro Failed", `${error}`, "error");
          }
        );
      },
      (error) => {
        showNotification("Failed Update", "Failed to update context transcript", "error");
      }
    );
  };

  const handleQuitEditing = () => {
    setEditing(false);
    createShortRequest(
      shortId,
      "v1/manual-override-transcript",
      0,
      (requestId) => {
        showNotification("Manual Override", `Request ID: ${requestId}`, "success");
      },
      (error) => {
        showNotification("Manual Override Failed", `${error}`, "error");
      }
    );
  };

  const [skipTrimmedContent, setSkipTrimmedContent] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);

  const handleWordSelection = (index: number) => {
    setSelectedRange((prevState) => {
      const newState = (() => {
        if (prevState.startIndex !== undefined) {
          if (prevState.endIndex !== undefined) {
            // If a range is already selected, clicking again clears the selection
            return { startIndex: undefined, endIndex: undefined };
          } else {
            // If only start index is defined, set the end index to complete the range
            if (index >= prevState.startIndex) {
              return { ...prevState, endIndex: index };
            } else {
              // If clicking before the start index, swap the indices
              return { startIndex: index, endIndex: prevState.startIndex };
            }
          }
        } else {
          // If nothing is selected, set the start index
          return { ...prevState, startIndex: index };
        }
      })();
      
      // Log the new selection state immediately
      console.log(`Word selection: index=${index}, new selection range:`, newState);
      
      return newState;
    });
  };

  const applyRangeOperation = (type: "delete" | "undelete") => {
    if (selectedRange.startIndex !== undefined && selectedRange.endIndex !== undefined) {
      const newLogs: Logs[] = [...short.logs, {
        type,
        start_index: selectedRange.startIndex,
        end_index: selectedRange.endIndex,
        message: `User Manual ${type.charAt(0).toUpperCase() + type.slice(1)} Between (${selectedRange.startIndex}-${selectedRange.endIndex})`,
        time: Timestamp.now()
      }];

      FirebaseFirestoreService.updateDocument(
        "shorts",
        shortId,
        { "logs": newLogs },
        () => {
          showNotification("Updated operation", `Added new ${type} operation`, "success");
          setSelectedRange({ startIndex: undefined, endIndex: undefined });
        },
        (error) => {
          showNotification("Failed Update", "Failed to update document", "error");
          setSelectedRange({ startIndex: undefined, endIndex: undefined });
        }
      );
    }
  };

  return (
    <div className="w-full h-full flex">
      {/* Main Content Area */}
      <div className={`flex-1 ${sidebarOpen ? 'pr-4' : ''} transition-all duration-300`}>
        <div className="w-full">
          {/* Video Player (moved out from tabs) */}
          <div className="w-full aspect-video mb-4">
            <VideoTranscriptPlayer 
              segment={segment} 
              operations={short.logs} 
              editing={editing}
              skipTrimmedContent={skipTrimmedContent}
              onToggleSkipTrimmed={setSkipTrimmedContent}
              activeWordIndex={activeWordIndex}
              onSeekToWord={(time) => {
                // When seeking from the video player, update active word if needed
                const segmentStartTime = segment.earliestStartTime || 0;
                const wordIndex = short.transcript.split(" ").findIndex((_, idx) => {
                  const word = segment.words && segment.words[idx];
                  if (!word) return false;
                  
                  const adjustedStartTime = word.start_time - segmentStartTime;
                  const adjustedEndTime = word.end_time - segmentStartTime;
                  return time >= adjustedStartTime && time <= adjustedEndTime;
                });
                
                if (wordIndex >= 0) {
                  setActiveWordIndex(wordIndex);
                }
              }}
            />
          </div>
          
          {/* Transcript Editor (shown when editing is true) */}
          {editing && (
            <div className="mb-4 bg-gray-900 rounded-md border border-gray-700 overflow-hidden">
              <div className="bg-gray-800 p-2 flex justify-between items-center">
                <h3 className="text-white font-semibold">Transcript Editor</h3>
                <div className="flex items-center gap-2">
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
              </div>
              
              {/* Transcript words display */}
              <div 
                ref={transcriptContainerRef}
                className="max-h-64 overflow-y-auto p-3 border-b border-gray-700"
              >
                <div className="flex flex-wrap gap-1 justify-center">
                  {short.transcript.split(" ").map((word, index) => {
                    // Determine word status from operations
                    let status = 'none';
                    short.logs.forEach(operation => {
                      if (operation.type === "delete" && index >= operation.start_index && index <= operation.end_index) {
                        status = 'deleted';
                      }
                      if (operation.type === "undelete" && index >= operation.start_index && index <= operation.end_index) {
                        status = 'none';
                      }
                    });
                    
                    // Calculate if this word is in the selected range
                    let isInSelectedRange = false;
                    
                    if (selectedRange.startIndex !== undefined) {
                      if (selectedRange.endIndex !== undefined) {
                        // Full range selected
                        const low = Math.min(selectedRange.startIndex, selectedRange.endIndex);
                        const high = Math.max(selectedRange.startIndex, selectedRange.endIndex);
                        isInSelectedRange = index >= low && index <= high;
                      } else {
                        // Only start selected
                        isInSelectedRange = index === selectedRange.startIndex;
                      }
                    }
                    
                    const isActive = index === activeWordIndex;
                    
                    return (
                      <span
                        key={index}
                        data-word-index={index}
                        className={`cursor-pointer px-1 py-0.5 rounded transition-all duration-150 relative
                          ${isInSelectedRange ? 'bg-blue-600 text-white font-semibold !important' : ''}
                          ${isActive ? 'bg-green-600 text-white font-bold' : ''}
                          ${status === 'deleted' ? 'bg-red-600 text-white' : 'text-white hover:bg-gray-700'}
                          hover:bg-blue-600
                        `}
                        style={{
                          backgroundColor: isInSelectedRange ? '#2563eb' : '',  // Blue-600 equivalent
                          color: isInSelectedRange ? 'white' : '',
                          fontWeight: isInSelectedRange ? '600' : ''
                        }}
                        onClick={() => handleWordSelection(index)}
                      >
                        {word}
                        {isInSelectedRange && selectedRange.startIndex === index && (
                          <span className="absolute -top-1 -left-1 bg-yellow-500 rounded-full w-2 h-2" 
                                title="Selection start"></span>
                        )}
                        {isInSelectedRange && selectedRange.endIndex === index && (
                          <span className="absolute -top-1 -right-1 bg-yellow-500 rounded-full w-2 h-2" 
                                title="Selection end"></span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
              
              {/* Editing controls */}
              <div className="p-3 bg-gray-800 flex flex-wrap gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={selectedRange.startIndex === undefined || selectedRange.endIndex === undefined}
                  onClick={() => applyRangeOperation('delete')}
                >
                  Delete Selected
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={selectedRange.startIndex === undefined || selectedRange.endIndex === undefined}
                  onClick={() => applyRangeOperation('undelete')}
                >
                  Undelete Selected
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={selectedRange.startIndex === undefined}
                  onClick={() => setSelectedRange({ startIndex: undefined, endIndex: undefined })}
                >
                  Clear Selection
                </Button>
              </div>
              
              {/* Help text */}
              <div className="p-2 bg-gray-900 text-xs text-gray-400">
                <p className="mb-1">
                  <strong>Range Selection:</strong> First click selects the starting word, second click completes the range.
                </p>
                <p className="mb-1">
                  <strong>Current Selection:</strong> {selectedRange.startIndex !== undefined ? 
                    (selectedRange.endIndex !== undefined ? 
                      `Words ${selectedRange.startIndex} to ${selectedRange.endIndex} selected` : 
                      `Started selection at word ${selectedRange.startIndex}`) : 
                    'No words selected'}
                </p>
                <p>
                  <strong>Tip:</strong> Selected words appear in <span className="text-blue-400">blue</span>. You can also click on the timeline to navigate.
                </p>
              </div>
            </div>
          )}
          
          {/* Edit Button */}
          <div className="mb-4">
            <Button
              onClick={() => editing ? handleQuitEditing() : setEditing(true)}
              variant={editing ? "destructive" : "default"}
              className="w-full"
            >
              {editing ? "Quit Editing" : "Edit Transcript"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Collapsible Sidebar */}
      <div className={`border-l border-gray-700 bg-gray-900 transition-all duration-300 flex ${sidebarOpen ? 'w-80' : 'w-10'}`}>
        {/* Toggle Button */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="h-full w-10 border-r border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          {sidebarOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
        
        {/* Sidebar Content */}
        {sidebarOpen && (
          <div className="flex-1 p-4">
            <h2 className="text-lg font-bold mb-4 text-white">Editor Tools</h2>
            
            <Tabs defaultValue="ai-tools" className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="ai-tools" className="flex-1">AI Tools</TabsTrigger>
                <TabsTrigger value="logs" className="flex-1">Edit History</TabsTrigger>
              </TabsList>
              
              {/* AI Tools Tab */}
              <TabsContent value="ai-tools">
                <div className="space-y-4">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">AI Generation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <CreditButton
                          creditCost={1}
                          confirmationMessage={"AI Generation costs 1 credit."}
                          onClick={requestAIGeneration}
                          variant="default"
                          className="w-full"
                        >
                          Standard Generation
                        </CreditButton>
                        <CreditButton
                          creditCost={1}
                          confirmationMessage={"AI Generation costs 1 credit."}
                          onClick={requestAIGenerationV2}
                          variant="outline"
                          className="w-full gap-2"
                        >
                          <Sparkles height={16} />
                          Advanced Generation
                        </CreditButton>
                        <CreditButton
                          creditCost={1}
                          confirmationMessage={"Requesting sound preview will cost you 1 credit."}
                          onClick={requestSoundPreview}
                          variant="secondary"
                          className="w-full"
                        >
                          Preview Sound
                        </CreditButton>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">AI Introduction</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <Input
                          value={contextTranscript}
                          onChange={(e) => setContextTranscript(e.target.value)}
                          placeholder="Enter context (max 20 words)"
                          maxLength={100}
                          className="bg-gray-700 border-gray-600"
                        />
                        <CreditButton
                          creditCost={2}
                          confirmationMessage={"You are requesting a contextual intro, this costs 2 credits."}
                          onClick={updateContextTranscript}
                          className="w-full"
                        >
                          Generate Intro
                        </CreditButton>
                        {short.intro_audio_path && (
                          <div className="mt-2">
                            <p className="text-sm text-white mb-1">Preview Intro:</p>
                            <AudioPlayer path={short.intro_audio_path} />
                          </div>
                        )}
                        {!short.intro_audio_path && (
                          <Button
                            onClick={() => {
                              showNotification("Load Audio", "Audio loading functionality to be implemented", "info");
                            }}
                            className="w-full mt-2"
                          >
                            Load Audio
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Logs Tab */}
              <TabsContent value="logs">
                <ScrollArea className="h-[500px] w-full rounded-md">
                  {short.logs.slice().reverse().map((value, index) => (
                    <Card key={index} className="mb-3 bg-gray-800 border-gray-700">
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-xs font-medium">
                          {value.type === "message" && "Server Message"}
                          {value.type === "error" && "Error Message"}
                          {value.type === "success" && "Success!"}
                          {(value.type === "delete" || value.type === "undelete") && (value.type === "delete" ? "Delete Operation" : "Undelete Operation")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-3">
                        <p className="text-sm">{value.message}</p>
                        {value.time && <p className="text-xs text-gray-400 mt-1">{value.time.toDate().toLocaleString()}</p>}
                        {(value.type === "delete" || value.type === "undelete") && (
                          <div className="flex flex-wrap gap-1 mt-2 p-2 bg-gray-900 rounded">
                            {short.transcript.split(" ").map((elem, wordIndex) => (
                              <span
                                key={wordIndex}
                                className={`
                                  text-white p-[2px] px-[5px] rounded font-light text-xs
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
                  
                  {short.logs.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removeLastOperation}
                      className="mt-2 w-full"
                    >
                      Undo Last Operation
                    </Button>
                  )}
                  
                  {short.logs.length === 0 && (
                    <div className="text-center p-4 text-gray-400">
                      No edit history available
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};