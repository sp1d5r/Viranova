import React, {useEffect, useState} from "react";
import FirebaseFirestoreService from "../../../services/database/strategies/FirebaseFirestoreService";
import {Task} from "../../../types/collections/Task";
import {CompletedTaskRow} from "./analytics-row/CompletedTaskRow";

export interface TasksTabProps {
  shortId: string;
}

export function formatDate(date: Date) {
  // Ensure the input is a Date object
  if (!(date instanceof Date)) {
    throw new Error("Invalid date");
  }

  // Get the components of the date
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = String(date.getFullYear()).slice(-2); // Get last two digits of year

  // Format the date as m:s dd/mm/yy
  return `${minutes}:${seconds} ${day}/${month}/${year}`;
}


export const TasksTab: React.FC<TasksTabProps> = ({shortId}) => {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<Task[]>([]);

  useEffect(() => {
    FirebaseFirestoreService.queryDocuments(
      'tasks',
      'shortId',
      shortId,
      'scheduledTime',
      (docs) => {
        setAllTasks(docs.map((elem) => {return elem as Task}));
        console.log('docs: ',docs)
      },
      (error) => {
        console.error(error.message)
      }
    )
  }, []);

  useEffect(() => {
    const completedTasks: Task[] = allTasks.filter((elem) => elem.status != 'Pending').reverse();
    const scheduledTasks: Task[] = allTasks.filter((elem) => elem.status == 'Pending');
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
                {formatDate(elem.scheduledTime.toDate())}
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