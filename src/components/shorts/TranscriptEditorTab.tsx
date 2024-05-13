import React, {useEffect, useRef, useState} from "react";
import {Logs, Short} from "../../types/collections/Shorts";
import {Segment} from "../../types/collections/Segment";
import FirebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import {useNotificaiton} from "../../contexts/NotificationProvider";
import FirebaseDatabaseService from "../../services/database/strategies/FirebaseFirestoreService";
import {Timestamp} from "firebase/firestore";
import {AudioPlayer} from "../audio/AudioPlayer";

export interface TranscriptEditorTabProps {
  short: Short;
  segment: Segment
  shortId: string;
}

export interface EditedTranscriptProps {
  transcript: string,
  operations: Logs[],
  editing: boolean,
  deleteRange: DeleteRange,
  setDeleteRange: React.Dispatch<React.SetStateAction<DeleteRange>>
}

export interface TranscriptWord {
  word: string,
  status: "none" | "deleted" | "selected",
}

type DeleteRange = {
  startIndex: undefined | number,
  endIndex: undefined | number
}

export const EditedTranscript: React.FC<EditedTranscriptProps> = ({transcript, operations, editing, deleteRange, setDeleteRange}) => {
  const [transcriptWords, setTranscriptWords] = useState<TranscriptWord[]>([]);

  useEffect(() => {
    const transcriptWord: TranscriptWord[] = transcript.split(" ").map((elem) => {return {word: elem, status: "none"}});
    console.log(transcriptWord.length);
    for (let operation of operations){
      if (operation.type === "delete") {
        for (let i = operation.start_index; i <= operation.end_index; i++) {
          if (transcriptWord[i]) { // Check if index exists
            transcriptWord[i].status = 'deleted';
          }
        }
      }

      if (deleteRange.startIndex && deleteRange.endIndex) {
        for (let i = deleteRange.startIndex; i <= deleteRange.endIndex; i++) {
          if (transcriptWord[i]) { // Check if index exists
            transcriptWord[i].status = 'selected';
          }
        }
      }else if (deleteRange.startIndex) {
        transcriptWord[deleteRange.startIndex].status = 'selected';
      }

    }
    setTranscriptWords(transcriptWord)
  }, [deleteRange]);

  const buttonPress = (index: number) => {
    setDeleteRange((prevState) => {
      if (prevState.startIndex) {
        if (prevState.endIndex) {
          return { startIndex: undefined, endIndex: undefined }
        } else {
          return {...prevState, endIndex: index}
        }
      } else {
        return {...prevState, startIndex: index}
      }
    })
  };

  return <span className="flex flex-wrap gap-1 my-2">
      {
        transcriptWords.map((elem, index) => {
          if (elem.status == "none") {
            return <button onClick={() => {buttonPress(index)}} disabled={!editing} className="text-white disabled:bg-gray-900  bg-gray-800 p-[2px] px-[5px] rounded border-gray-500 border ">{elem.word}</button>
          } else if (elem.status == "deleted") {
            return <button onClick={() => {buttonPress(index)}} disabled={!editing} className="text-white bg-red-900 p-[2px] px-[5px] rounded border-gray-500 border">{elem.word}</button>
          } else {
            return <button onClick={() => {buttonPress(index)}} disabled={!editing} className="text-white bg-blue-900 p-[2px] px-[5px] rounded border-gray-500 border">{elem.word}</button>
          }
        })
      }
    </span>
}

export const TranscriptEditorTab: React.FC<TranscriptEditorTabProps> = ({short, segment, shortId}) => {
  const scrollRef = useRef<HTMLOListElement>(null);
  const [editing, setEditing] = useState(false);
  const [deleteRange, setDeleteRange] = useState<DeleteRange>({startIndex: undefined, endIndex: undefined});
  const {showNotification} = useNotificaiton();

  useEffect(() => {
    // Scroll to the top of the container
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const addDeleteOperation = (deleteRange: DeleteRange) => {
    if (deleteRange.startIndex && deleteRange.endIndex) {
      const newLogs: Logs[] = short.logs;
      newLogs.push({
        type: "delete",
        start_index: deleteRange.startIndex,
        end_index: deleteRange.endIndex,
        message: `User Manual Delete Between (${deleteRange.startIndex}-${deleteRange.endIndex})`,
        time: Timestamp.now()
      })
      FirebaseDatabaseService.updateDocument(
        "shorts",
        shortId,
        {
          "logs": newLogs
        },
        ()=>{
          showNotification("Updated operation", "Added new operation", "success");
          setDeleteRange({ startIndex: undefined, endIndex: undefined });
        },
        (error) => {
          showNotification("Failed Update", "Falied to update document", "error");
          setDeleteRange({ startIndex: undefined, endIndex: undefined })
        }
      )
    }
  }

  return <div className="p-6 text-medium text-gray-400 bg-gray-900 rounded-lg w-full flex flex-col gap-2">
    <span className="text-xl font-bold text-white mb-2 flex justify-between items-center">
      Transcript Editor
      <div className="inline-flex rounded-md shadow-sm" role="group">
        <button onClick={() => {setEditing(prevState => !prevState)}} type="button" className={` px-4 py-2 text-sm font-medium border rounded-s-lg focus:z-10 focus:ring-2  ${editing ? "bg-red-500 hover:bg-red-700" : "bg-gray-800 hover:bg-gray-700"}  border-gray-700 text-white hover:text-white  focus:ring-blue-500 focus:text-white`}>
          {editing ? "Quit Editing" : "Edit Transcript"}
        </button>
        { editing &&
          <button
            onClick={() => {
              addDeleteOperation(deleteRange)
            }}
            disabled={!editing}
            type="button"
            className="px-4 py-2 text-sm font-medium border focus:z-10 focus:ring-2 bg-gray-800 border-gray-700 text-white hover:text-white hover:bg-gray-700 focus:ring-blue-500 focus:text-white"
          >
            Complete
          </button>
        }


        <button
          onClick={() => {
            FirebaseDatabaseService.updateDocument(
              "shorts",
              shortId,
              {
                "previous_short_status": "Request Audio Generation",
                "short_status": "Generate Audio"
              },
              ()=>{
                showNotification("Updated operation", "Added new operation", "success");
                setDeleteRange({ startIndex: undefined, endIndex: undefined });
              },
              (error) => {
                showNotification("Failed Update", "Falied to update document", "error");
                setDeleteRange({ startIndex: undefined, endIndex: undefined })
              }
            )
          }}
          type="button"
          className="px-4 py-2 text-sm font-medium border focus:z-10 focus:ring-2 bg-gray-800 border-gray-700 text-white hover:text-white hover:bg-gray-700 focus:ring-blue-500 focus:text-white"
        >
          Preview Sound
        </button>

        <button
          onClick={() => {

          }}
          disabled={!editing}
          type="button"
          className="px-4 py-2 text-sm font-medium border focus:z-10 focus:ring-2 bg-gray-800 border-gray-700 text-white hover:text-white hover:bg-gray-700 focus:ring-blue-500 focus:text-white"
        >
          Evaluate Transcript
        </button>


        <button onClick={() => {
          console.log(shortId);
          FirebaseFirestoreService.updateDocument(
            "shorts",
            shortId,
            {
              "previous_short_status": "Request AI Extraction",
              "short_status": "Edit Transcript"
            },
            () => {
              showNotification("Edited", "Began Audio Preview", "success");
              setEditing(false);
            },
            (error) => {
              showNotification("Error", `Failed: ${error}`, "success");
              setEditing(false);
            }
          )
        }} type="button" className="px-4 py-2 text-sm font-medium border rounded-e-lg focus:z-10 focus:ring-2 bg-green-800 border-gray-700 text-white hover:text-white hover:bg-green-700 focus:ring-blue-500 focus:text-white">
          AI Generation
        </button>
      </div>
    </span>
    <p className="mb-2">Edit the Transcript below before continuing on with visual attention analysis...</p>

    {
      short.temp_audio_file && short.temp_audio_file !== "Loading ..." && (
        <>
          <div className="font-bold text-white flex w-full justify-between">
            <p>Preview Audio</p>
          </div>
          <AudioPlayer path={short.temp_audio_file}/>
        </>
      )
    }

    <div className="font-bold text-white flex w-full justify-between">
      <p>Output Transcript</p>
    </div>

    {editing && <p>If you're editing the transcript, pick a start and an end position then press confirm.</p>}
    <EditedTranscript transcript={short.transcript} operations={short.logs} editing={editing} deleteRange={deleteRange} setDeleteRange={setDeleteRange}/>

    <p className="font-bold text-white">Timeline</p>
    <ol ref={scrollRef} className="relative border-s border-gray-200 dark:border-gray-700 m-5 flex flex-col-reverse overflow-y-scroll flex-1">
      {/* Log - Message */}
      {
        short.logs.map((value, index) => {
          if (value.type == "message") {
            return <li className="mb-2 ms-4">
              <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
              <time className="mb-1 text-sm font-normal leading-none text-gray-500">{value.time.toDate().toString()}</time>
              <h3 className="text-lg font-semibold text-white">Server Message</h3>
              <p className="mb-4 text-base font-normal text-gray-400">{value.message}</p>
            </li>;
          } else if (value.type == "error") {
            return <li className="mb-2 ms-4">
              <div className="absolute w-3 h-3 rounded-full mt-1.5 -start-1.5 border border-red-900 bg-red-700"></div>
              <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{value.time.toDate().toString()}</time>
              <h3 className="text-lg font-semibold text-red-500">Error Message</h3>
              <p className="text-base font-normal text-gray-400">{value.message}</p>
            </li>
          } else if (value.type == "success") {
            return <li className="mb-2 ms-4">
              <div className="absolute w-3 h-3 rounded-full mt-1.5 -start-1.5 border border-green-900 bg-green-700"></div>
              <time className="mb-1 text-sm font-normal leading-nonetext-gray-500">{value.time.toDate().toString()}</time>
              <h3 className="text-lg font-semibold text-green-500">Success!</h3>
              <p className="text-base font-normal text-gray-500 dark:text-gray-400">{value.message}</p>
            </li>
          } else if (value.type == "delete") {
            return <li className="mb-10 ms-4">
              <div className="absolute w-3 h-3 rounded-full mt-1.5 -start-1.5 border border-blue-900 bg-blue-700"></div>
              <time className="mb-1 text-sm font-normal leading-nonetext-gray-500">{value.time.toDate().toString()}</time>
              <h3 className="text-lg font-semibold text-blue-500">Editing</h3>
              <p className="text-base font-normal text-gray-500 dark:text-gray-400">{value.message}</p>

              <span className="flex flex-wrap gap-1 my-2">
                {
                  short.transcript.split(" ").map((elem, index) => {
                    if (index < value.start_index || index > value.end_index) {
                      return <span className="text-white bg-gray-900 p-[2px] px-[5px] rounded border-gray-500 border">{elem}</span>
                    } else {
                      return <span className="text-white bg-red-950 p-1 rounded">{elem}</span>
                    }
                  })
                }
              </span>
            </li>
          }
        }).reverse()
      }
    </ol>
  </div>
}