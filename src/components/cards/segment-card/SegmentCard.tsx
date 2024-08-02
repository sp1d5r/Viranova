import React, {useEffect, useState} from "react";
import FirebaseDatabaseService from "../../../services/database/strategies/FirebaseFirestoreService";
import FirebaseFirestoreService from "../../../services/database/strategies/FirebaseFirestoreService";
import {deleteSegment, documentToSegment, Segment} from "../../../types/collections/Segment";
import {useNotification} from "../../../contexts/NotificationProvider";
import {documentToUserVideo} from "../../../types/collections/UserVideo";
import {deleteShort, Short} from "../../../types/collections/Shorts";
import LangSmithFeedback from "../../../services/langchain";
import {ReviewLangchainLogs} from "../../review-langchain-run/ReviewLangchainLog";
import {useAuth} from "../../../contexts/Authentication";

export interface SegmentCardProps{
  currentSegment: Segment,
  segmentId: string,
  currentTime: number
}

export const SegmentCard: React.FC<SegmentCardProps> = ({currentSegment, segmentId, currentTime}) => {
  const {showNotification} = useNotification();
  const [segment, setSegment] = useState<Segment>(currentSegment);
  const [shorts, setShorts] = useState<Short[]>([])
  const [fullTranscriptShown, setFullTranscript] = useState(false);
  const {authState} = useAuth();

  useEffect(() => {
    FirebaseFirestoreService.listenToDocument(
      'topical_segments',
      segmentId,
      (document) => {
        if (document) {
          setSegment(documentToSegment(document));
        }
      }
    )
  }, [segment]);

  useEffect(() => {
    if (segment) {
      FirebaseDatabaseService.queryDocuments(
        "shorts",
        "segment_id",
        segmentId,
        "start_index",
        (tempShorts) => {
          setShorts(tempShorts.map((elem)=> {
            return elem as Short
          }))
        },(error)=>{
          console.log(`Error... ${error}`)
        }
      )
    }
  }, [segment]);

  if (segment) {
    return <div
      className={`flex flex-col gap-2 border border-emerald-700 flex-1 min-h-36 rounded-xl p-5
                            ${segment.flagged ? "border-danger text-danger": "text-white"}
                            `}
      key={segmentId}
    >
      {segment.flagged &&
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
          <span className="font-medium">Error!</span> This segment has been flagged for inappropriate content.
        </div>
      }
      <span className="flex gap-5 flex-wrap">
                                <span className="font-bold text-2xl">{segment.segmentTitle}</span>
        {segment.segmentStatus && <span className="bg-green-100 text-green-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 flex gap-2 items-center">
                                    <div role="status">
                                        <svg aria-hidden="true" className="inline w-2 h-2 text-gray-200 animate-spin dark:text-gray-600 fill-green-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                        </svg>
                                        <span className="sr-only">Loading...</span>
                                    </div>
          {segment.segmentStatus}
                                </span>}
                            </span>
      <span className={"font-light text-gray-300"}>{segmentId} </span>
      <span className={"font-light text-gray-300"}>{segment.earliestStartTime} - {segment.latestEndTime} </span>
      <ol className="relative border-s border-gray-200 dark:border-gray-700">
        <li className="mb-10 ms-4">
          <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
          <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">Segment Transcript Extracted</time>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transcript</h3>
          {
            fullTranscriptShown ?
              <p className="mb-4 text-base font-normal text-gray-400">{segment.transcript}</p>
              :
              <p className="mb-4 text-base font-normal text-gray-400">{segment.transcript.substring(0, 400)} ...</p>
          }
          {
            fullTranscriptShown ?
              <button onClick={() => {setFullTranscript(false);}} className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-100 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 gap-3">Hide full transcript
                <svg className="w-5 h-5 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 15 7-7 7 7"/>
                </svg>
              </button>
              :
              <button onClick={() => {setFullTranscript(true);}} className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-100 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 gap-3">View full transcript
                <svg className="w-5 h-5 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7"/>
                </svg>
              </button>
          }

        </li>
        {segment.segmentSummary && <li className="mb-10 ms-4">
          <div
            className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
          <time
            className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">Segment
            Summarised
          </time>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h3>
          <p
            className="text-base font-normal text-gray-500 dark:text-gray-400">{segment.segmentSummary}</p>
        </li>}

        {segment.flagged !== undefined && <li className="ms-4">
          <div
            className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
          <time
            className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
            Moderation Completed
          </time>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Segment
            Moderated</h3>
          <div className={"flex gap-2 py-2 items-center flex-wrap"}>
            <p>Alerts: </p>
            <div
              className={segment.harassment ? "border-danger border text-danger rounded" : "border-success border text-success rounded"}>
              <p className={"px-2 py-1"}> Harassment </p></div>
            <div
              className={segment.harassmentThreatening ? "border-danger border text-danger rounded" : "border-success border text-success rounded"}>
              <p className={"px-2 py-1"}> Threatening </p></div>
            <div
              className={segment.hate ? "border-danger border text-danger rounded" : "border-success border text-success rounded"}>
              <p className={"px-2 py-1"}> Hate </p></div>
            <div
              className={segment.sexual ? "border-danger border text-danger rounded" : "border-success border text-success rounded"}>
              <p className={"px-2 py-1"}> Sexual </p></div>
            <div
              className={segment.sexualMinors ? "border-danger border text-danger rounded" : "border-success border text-success rounded"}>
              <p className={"px-2 py-1"}> Sexual/Minors </p></div>
            <div
              className={segment.selfHarm ? "border-danger border text-danger rounded" : "border-success border text-success rounded"}>
              <p className={"px-2 py-1"}> Self Harm </p></div>
            <div
              className={segment.selfHarmIntent ? "border-danger border text-danger rounded" : "border-success border text-success rounded"}>
              <p className={"px-2 py-1"}> Self Harm Intent </p></div>
          </div>
        </li>}

        {segment.shortIdea && <li className="mb-10 ms-4">
          <div
            className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
          <time
            className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
            Short Idea Generated
          </time>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Short Idea</h3>
          <p className="text-base font-normal text-gray-500 dark:text-gray-400 pb-2">
            <span className="font-bold">Idea: </span>
            {segment.shortIdea}
          </p>
          <p className="text-base font-normal text-gray-500 dark:text-gray-400">
            <span className="font-bold">Justification: </span>
            {segment.shortIdeaExplanation}
          </p>
          <div className="flex gap-2 items-center w-full">
            <button
              onClick={() => {
              FirebaseDatabaseService.addDocument(
                "shorts",
                {
                  "segment_id": segmentId,
                  "logs": [],
                  "transcript": segment.transcript,
                  "short_idea": segment.shortIdea,
                  "short_idea_explanation": segment?.shortIdeaExplanation,
                  "short_idea_run_id": segment?.shortRunId,
                  "video_id": segment?.videoId,
                  "start_index": segment.startIndex,
                  "end_index": segment.endIndex,
                  "error_count": 5,
                  "short_status": "Short Creation Began",
                  "previous_short_status": "Short Creation Began",
                  "pending_operation": false,
                  "uid": authState.user?.uid,
                },
                (shortId)=>{
                  window.location.href = `/shorts?short_id=${shortId}`
                },
                (error) => {
                  showNotification("Document Creation", `${error}`, "error")
                }
              )
            }}
              className="inline-flex items-center px-4 py-2 my-2 text-sm font-medium border rounded-lg focus:z-10 focus:ring-4 focus:outline-none focus:text-emerald-700 bg-gray-800 text-gray-200 border-emerald-600 hover:text-white hover:bg-emerald-700 focus:ring-emerald-700 gap-3">
              Generate Short
              <svg className="w-3 h-3 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
              </svg>
            </button>
            <ReviewLangchainLogs runId={segment.shortRunId} />
          </div>
        </li>}

        {
          shorts.map((elem) => {
            return <li className="mb-10 ms-4">
              <div
                className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
              <time
                className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                New Short Generated
              </time>
              <span className="text-lg font-semibold text-white flex gap-5 items-center flex-wrap">
                Generated Short
                <span className="text-white-400 text-sm font-normal mb-0">{elem.id}</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-blue-400 border border-blue-400">
                <svg className="w-2.5 h-2.5 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm3.982 13.982a1 1 0 0 1-1.414 0l-3.274-3.274A1.012 1.012 0 0 1 9 10V6a1 1 0 0 1 2 0v3.586l2.982 2.982a1 1 0 0 1 0 1.414Z"/>
                </svg>
                  {elem.logs.length > 0 && <p>{elem.logs[elem.logs.length - 1].time.toDate().toString()}</p>}
                </span>
              </span>
              <p className="text-base font-normal text-gray-400 pb-2">
                <span className="font-bold">Idea: </span>
                {segment.shortIdea}
              </p>
              <p className="text-base font-normal text-gray-400">
                <span className="font-bold">Justification: </span>
                {segment.shortIdeaExplanation}
              </p>
              <p className="text-base font-normal text-gray-400">
                <span className="font-bold">Most Recent Log: </span>
                {elem.logs.length > 0 && elem.logs[elem.logs.length - 1].message}
              </p>

              <div className="flex gap-2">
                <button onClick={() => {
                  window.location.href = `/shorts?short_id=${elem.id}`
                }} className="inline-flex items-center px-4 py-2 my-2 text-sm font-medium border rounded-lg focus:z-10 focus:ring-4 focus:outline-none focus:text-blue-700 bg-gray-800 text-gray-200 border-blue-600 hover:text-white hover:bg-blue-700 focus:ring-blue-700 gap-3">
                  Edit
                  <svg className="w-5 h-5 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M18 14v4.833A1.166 1.166 0 0 1 16.833 20H5.167A1.167 1.167 0 0 1 4 18.833V7.167A1.166 1.166 0 0 1 5.167 6h4.618m4.447-2H20v5.768m-7.889 2.121 7.778-7.778"/>
                  </svg>
                </button>
                <button onClick={() => {
                  deleteShort(elem.id);
                }} className="inline-flex items-center px-4 py-2 my-2 text-sm font-medium border rounded-lg focus:z-10 focus:ring-4 focus:outline-none focus:text-red-700 bg-gray-800 text-gray-200 border-red-600 hover:text-white hover:bg-red-700 focus:ring-red-700 gap-3">
                  Delete
                  <svg className="w-5 h-5 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
                  </svg>
                </button>
              </div>
            </li>
          })
        }
      </ol>

      <div>


        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button type="button" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border border-gray-900 rounded-s-lg hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">
            <svg className="w-3 h-3 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
            </svg>
            Merge Below
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border-t border-b border-gray-900 hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-red-500 focus:bg-red-900 focus:text-white dark:border-red-500 dark:text-white dark:hover:text-white dark:hover:bg-red-700 dark:focus:bg-red-700"
            onClick={() => {
              deleteSegment(segmentId);
            }}
          >
            <svg className="w-3 h-3 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12.25V1m0 11.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M4 19v-2.25m6-13.5V1m0 2.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M10 19V7.75m6 4.5V1m0 11.25a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM16 19v-2"/>
            </svg>
            Delete Segment
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border border-gray-900 rounded-e-lg hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700"
            onClick={() => {
              FirebaseFirestoreService.updateDocument(
                "topical_segments",
                segmentId,
                {
                  "segment_status": "Regenerate Short",
                  "previous_segment_status": "Requested Regenerate Short"
                },
                () => {
                  showNotification("Requested Update", "Generating Short", "success")
                },
                () => {
                  showNotification("Requested Update", "Failed to generate idea", "error")
                }
              )
            }}
          >
            <svg className="w-5 h-5 mr-2 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"/>
            </svg>
            Regenerate Short Idea
          </button>
        </div>
      </div>
    </div>
  } else {
    return <div
      className={"flex flex-col gap-2 border border-accent w-full min-h-36 rounded-xl p-5"}
      key={segmentId}
    >
        <div className="p-4 mb-4 text-sm  rounded-lg bg-gray-800 text-blue-400" role="alert">
          <span className="font-medium">Loading...</span> Loading all the information related to the segment...
        </div>
    </div>
  }
}