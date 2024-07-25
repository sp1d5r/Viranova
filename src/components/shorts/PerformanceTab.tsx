import React, {useState} from "react";
import {Short} from "../../types/collections/Shorts";
import {TasksTab} from "./performance-tab/TasksTab";
import {AnalyticsTab} from "./performance-tab/AnalyticsTab";

export interface PerformanceTabProps {
  short: Short;
  shortId: string;
}

type PerformanceTabTypes = 'Tasks' | 'Analytics';
const allTabs: PerformanceTabTypes[] = ['Tasks', 'Analytics'];

export const PerformanceTab :React.FC<PerformanceTabProps> = ({short, shortId}) => {
  const [tabSelected, setTabSelected] = useState<PerformanceTabTypes>('Tasks');


  return <div className="p-6 text-medium text-gray-400 bg-gray-900 rounded-lg w-full">
    <nav className="flex my-2 mb-4 px-5 py-3 text-gray-700 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse ">
        <li className="inline-flex items-center">
          <a href="#" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
            <svg className="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
            </svg>
            Home
          </a>
        </li>
        <li>
          <div className="flex items-center">
            <svg className="rtl:rotate-180 block w-3 h-3 mx-1 text-gray-400 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
            </svg>
            <a href={`/video-temporal-segmentation?video_id=${short.video_id}`} className="ms-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white">Segments</a>
          </div>
        </li>
        <li aria-current="page">
          <div className="flex items-center">
            <svg className="rtl:rotate-180  w-3 h-3 mx-1 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
            </svg>
            <span className="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400">Transcript Editor</span>
          </div>
        </li>
        <li aria-current="page">
          <div className="flex items-center">
            <svg className="rtl:rotate-180  w-3 h-3 mx-1 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
            </svg>
            <span className="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400">Video Editor</span>
          </div>
        </li>
      </ol>
    </nav>


    <h3 className="text-xl font-bold text-white mb-2">Performance</h3>
    <p className="mb-2">Analyse the performance of the video posted.</p>


    <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
      {
        allTabs.map((elem) => {
          return <li className="me-2">
            <button disabled={tabSelected === elem} type="button" onClick={()=>{setTabSelected(elem)}} aria-current="page" className="inline-block p-4 rounded-t-lg active disabled:bg-gray-800 disabled:text-emerald-500">{elem}</button>
          </li>
        })
      }
    </ul>

    {
      tabSelected === 'Tasks' && <TasksTab shortId={shortId}/>
    }
    {
      tabSelected === 'Analytics' && <AnalyticsTab shortId={shortId}/>
    }

  </div>
}