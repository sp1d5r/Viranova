import React, {useEffect, useState} from "react";
import FirebaseFirestoreService from "../../../services/database/strategies/FirebaseFirestoreService";
import {AnalyticsTask} from "../../../types/collections/Task";
import {CompletedTaskRow} from "./analytics-row/CompletedTaskRow";
import {Timestamp} from "firebase/firestore";

export interface TasksTabProps {
  shortId: string;
}

export const formatTimestamp = (timestamp: Timestamp | undefined): string => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate();
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};


export const TasksTab: React.FC<TasksTabProps> = ({shortId}) => {
  const [allTasks, setAllTasks] = useState<AnalyticsTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<AnalyticsTask[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<AnalyticsTask[]>([]);

  useEffect(() => {
    FirebaseFirestoreService.queryDocuments(
      'tasks',
      'shortId',
      shortId,
      'scheduledTime',
      (docs) => {
        setAllTasks(docs.map((elem) => {return elem as AnalyticsTask}));
        console.log('docs: ',docs)
      },
      (error) => {
        console.error(error.message)
      }
    )
  }, []);

  useEffect(() => {
    const completedTasks: AnalyticsTask[] = allTasks.filter((elem) => elem.status != 'Pending').reverse();
    const scheduledTasks: AnalyticsTask[] = allTasks.filter((elem) => elem.status == 'Pending');
    setCompletedTasks(completedTasks);
    setScheduledTasks(scheduledTasks);
  }, [allTasks]);

  return <div className="w-full gap-4 my-4 flex flex-col">
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <caption className="p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-white dark:bg-gray-800">
          Completed Tasks
          <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">Data collection tasks that need to be completed.</p>
        </caption>
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3">
            Status
          </th>
          <th scope="col" className="px-6 py-3">
            Time
          </th>
          <th scope="col" className="px-6 py-3">
            View
          </th>
          <th scope="col" className="px-6 py-3">
            Comment
          </th>
          <th scope="col" className="px-6 py-3">
            Share
          </th>
          <th scope="col" className="px-6 py-3">
            Like
          </th>
          <th scope="col" className="px-6 py-3">
            <span className="sr-only">Edit</span>
          </th>
        </tr>
        </thead>
        <tbody>
        {
          completedTasks.map((elem) => {
            return <CompletedTaskRow task={elem} />
          })
        }
        </tbody>
      </table>
    </div>
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <caption className="p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-white dark:bg-gray-800">
          Scheduled Tasks
          <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">Data collection tasks set to be completed in the future...</p>
        </caption>
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3">
            Task Type
          </th>
          <th scope="col" className="px-6 py-3">
            Status
          </th>
          <th scope="col" className="px-6 py-3">
            Scheduled Time
          </th>
          <th scope="col" className="px-6 py-3">
            Reschedule
          </th>
          <th scope="col" className="px-6 py-3">
            <span className="sr-only">Edit</span>
          </th>
        </tr>
        </thead>
        <tbody>
        {
          scheduledTasks.map((elem) => {
            return <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {elem.operation}
              </th>
              <td className="px-6 py-4">
                {elem.status}
              </td>
              <td className="px-6 py-4">
                {formatTimestamp(elem.scheduledTime)}
              </td>
              <td className="px-6 py-4">
                <a href="#" className="font-medium text-emerald-500 hover:underline">Reschedule</a>
              </td>
              <td className="px-6 py-4 text-right">
                <a href="#" className="font-medium text-red-500 hover:underline">Delete</a>
              </td>
            </tr>
          })
        }
        </tbody>
      </table>
    </div>
  </div>
}