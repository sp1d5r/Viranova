import React, {useState} from 'react';
import LangSmithFeedback from "../../services/langchain";
import {useNotificaiton} from "../../contexts/NotificationProvider";


export interface ReviewLangchainLogProps {
  runId: string;

}

export const ReviewLangchainLogs : React.FC<ReviewLangchainLogProps> = ({runId}) => {
  const {showNotification} = useNotificaiton();

  const [commentSection, setCommentSection] = useState({
    visible: false,
    comment: '',
  })

  return (
    <div className="flex gap-2 flex-1 items-center">
      {!commentSection.visible && <>
        <button
          onClick={() => {
            LangSmithFeedback.addFeedback({runId: runId, score: 1, comment: ""}).then(() => {
              showNotification('Feedback Added', 'This will be noted during generation.', 'info');
            }).catch((err) => {
              showNotification('Feedback Failed', err.toString(), 'error');
            })
          }}
          className="inline-flex items-center px-4 py-2 my-2 text-sm font-medium border rounded-lg focus:z-10 focus:ring-4 focus:outline-none focus:text-emerald-700 bg-gray-800 text-gray-200 border-emerald-600 hover:text-white hover:bg-emerald-700 focus:ring-emerald-700 gap-3"
        >
          <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true"
               xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd"
                  d="M15.03 9.684h3.965c.322 0 .64.08.925.232.286.153.532.374.717.645a2.109 2.109 0 0 1 .242 1.883l-2.36 7.201c-.288.814-.48 1.355-1.884 1.355-2.072 0-4.276-.677-6.157-1.256-.472-.145-.924-.284-1.348-.404h-.115V9.478a25.485 25.485 0 0 0 4.238-5.514 1.8 1.8 0 0 1 .901-.83 1.74 1.74 0 0 1 1.21-.048c.396.13.736.397.96.757.225.36.32.788.269 1.211l-1.562 4.63ZM4.177 10H7v8a2 2 0 1 1-4 0v-6.823C3 10.527 3.527 10 4.176 10Z"
                  clip-rule="evenodd"/>
          </svg>
        </button>
          <button
          onClick={() => {setCommentSection({visible: true, comment: ""})}}
        className="inline-flex items-center px-4 py-2 my-2 text-sm font-medium border rounded-lg focus:z-10 focus:ring-4 focus:outline-none focus:text-rose-700 bg-gray-800 text-gray-200 border-rose-600 hover:text-white hover:bg-rose-700 focus:ring-rose-700 gap-3"
      >
        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
             width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path fill-rule="evenodd"
                d="M8.97 14.316H5.004c-.322 0-.64-.08-.925-.232a2.022 2.022 0 0 1-.717-.645 2.108 2.108 0 0 1-.242-1.883l2.36-7.201C5.769 3.54 5.96 3 7.365 3c2.072 0 4.276.678 6.156 1.256.473.145.925.284 1.35.404h.114v9.862a25.485 25.485 0 0 0-4.238 5.514c-.197.376-.516.67-.901.83a1.74 1.74 0 0 1-1.21.048 1.79 1.79 0 0 1-.96-.757 1.867 1.867 0 0 1-.269-1.211l1.562-4.63ZM19.822 14H17V6a2 2 0 1 1 4 0v6.823c0 .65-.527 1.177-1.177 1.177Z"
                clip-rule="evenodd"/>
        </svg>
      </button>
      </>
    }
      {
        commentSection.visible && <>
          <div className="flex-1">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-900 dark:text-white">
              <input
                type="text"
                id="comment"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Give a brief explanation for why"
                required
                value={commentSection.comment}
                onChange={(e) => {setCommentSection({visible: true, comment: e.target.value})}}
              />
            </label>
          </div>
          <button
            onClick={() => {
              LangSmithFeedback.addFeedback({runId: runId, score: -1, comment: commentSection.comment}).then(() => {
                showNotification('Feedback Added', 'This will be noted during generation.', 'info');
              }).catch((err) => {
                showNotification('Feedback Failed', err.toString(), 'error');
              })
            }}
            className="inline-flex items-center px-4 py-2 my-2 text-sm font-medium border rounded-lg focus:z-10 focus:ring-4 focus:outline-none focus:text-emerald-700 bg-gray-800 text-gray-200 border-emerald-600 hover:text-white hover:bg-emerald-700 focus:ring-emerald-700 gap-3"
          >
            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5"/>
            </svg>
          </button>
          <button
            onClick={() => {setCommentSection({visible: false, comment: ""})}}
            className="inline-flex items-center px-4 py-2 my-2 text-sm font-medium border rounded-lg focus:z-10 focus:ring-4 focus:outline-none focus:text-rose-700 bg-gray-800 text-gray-200 border-rose-600 hover:text-white hover:bg-rose-700 focus:ring-rose-700 gap-3"
          >
            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/>
            </svg>
          </button>
        </>
      }
    </div>
  )
}