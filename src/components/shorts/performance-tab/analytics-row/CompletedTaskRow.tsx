import React, {useEffect, useState} from 'react';
import {AnalyticsTask} from "../../../../types/collections/Task";
import FirebaseFirestoreService from "../../../../services/database/strategies/FirebaseFirestoreService";
import {Analytics} from "../../../../types/collections/Analytics";
import {formatTimestamp} from "../TasksTab";

export interface CompletedTaskRowProps {
  task: AnalyticsTask;
}

export const CompletedTaskRow: React.FC<CompletedTaskRowProps> = ({task}) => {
  const [analytics, setAnalytics] = useState<Analytics | undefined>(undefined);
  useEffect(() => {
    FirebaseFirestoreService.queryDocuments(
      'analytics',
      'taskResultId',
      task.taskResultId,
      'taskTime',
      (docs) => {
        if (docs.length > 0) {
          setAnalytics(docs[0] as Analytics);
        }
      },
      (error) => {
        console.error(error.message)
      }
    )
  }, [task]);

  return <tr className="border-b bg-gray-800 border-gray-700">
    <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap text-white flex gap-2">
      {task.operation}

      {task.status == 'Pending' && <span className="text-xs font-medium me-2 px-2.5 py-0.5 rounded bg-blue-900 text-blue-300">Pending</span>}
      {task.status == 'Failed' && <span className="text-xs font-medium me-2 px-2.5 py-0.5 rounded bg-red-900 text-red-300">Failed</span>}
      {task.status == 'Complete' && <span className="text-xs font-medium me-2 px-2.5 py-0.5 rounded bg-green-900 text-green-300">Complete</span>}
      {task.status == 'Running' && <span className="text-xs font-medium me-2 px-2.5 py-0.5 rounded bg-pink-900 text-pink-300">Running</span>}

    </th>
    <td className="px-6 py-4">
      {task.processingStartTime ? formatTimestamp(task.processingStartTime) : 'N/A'}
    </td>
    <td className="px-6 py-4">
      {analytics && analytics.videoAnalytics.length > 0 ? analytics.videoAnalytics[0].playCount : 'N/A'}
    </td>
    <td className="px-6 py-4">
      {analytics && analytics.videoAnalytics.length > 0 ? analytics.videoAnalytics[0].commentCount: 'N/A'}
    </td>
    <td className="px-6 py-4">
      {analytics && analytics.videoAnalytics.length > 0 ? analytics.videoAnalytics[0].shareCount: 'N/A'}
    </td>
    <td className="px-6 py-4">
      {analytics && analytics.videoAnalytics.length > 0 ? analytics.videoAnalytics[0].diggCount: 'N/A'}
    </td>
    <td className="px-6 py-4 text-right">
      <a href="#" className="font-medium text-red-500 hover:underline">Delete</a>
    </td>
  </tr>
}