import React, { useEffect, useState } from 'react';
import { AnalyticsTask } from "../../../../types/collections/Task";
import FirebaseFirestoreService from "../../../../services/database/strategies/FirebaseFirestoreService";
import { Analytics } from "../../../../types/collections/Analytics";
import { formatTimestamp } from "../TasksTab";

export interface CompletedTaskRowProps {
  task: AnalyticsTask;
  onTaskDeleted: () => void;
}

export const CompletedTaskRow: React.FC<CompletedTaskRowProps> = ({ task, onTaskDeleted }) => {
  const [analytics, setAnalytics] = useState<Analytics | undefined>(undefined);

  useEffect(() => {
    fetchAnalytics();
  }, [task]);

  const fetchAnalytics = () => {
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
        console.error(error.message);
      }
    );
  };

  const deleteTaskAndAnalytics = () => {
    // Delete the task
    FirebaseFirestoreService.deleteDocument(
      'tasks',
      task.id!,
      () => {
        console.log("Successfully deleted task!");

        // If there's associated analytics, delete it too
        if (analytics) {
          FirebaseFirestoreService.deleteDocument(
            'analytics',
            analytics.id,
            () => {
              console.log("Successfully deleted associated analytics!");
              onTaskDeleted(); // Notify parent component to refresh the task list
            },
            (error) => {
              console.error("Failed to delete associated analytics:", error.message);
              onTaskDeleted(); // Still notify parent to refresh, even if analytics deletion failed
            }
          );
        } else {
          onTaskDeleted(); // If no analytics, just notify parent to refresh
        }
      },
      (error) => {
        console.error("Failed to delete task:", error.message);
      }
    );
  };

  return (
    <tr className="border-b bg-gray-800 border-gray-700">
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
        {analytics && analytics.videoAnalytics.length > 0 ? analytics.videoAnalytics[0].commentCount : 'N/A'}
      </td>
      <td className="px-6 py-4">
        {analytics && analytics.videoAnalytics.length > 0 ? analytics.videoAnalytics[0].shareCount : 'N/A'}
      </td>
      <td className="px-6 py-4">
        {analytics && analytics.videoAnalytics.length > 0 ? analytics.videoAnalytics[0].diggCount : 'N/A'}
      </td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={deleteTaskAndAnalytics}
          className="font-medium text-red-500 hover:underline"
        >
          Delete
        </button>
      </td>
    </tr>
  );
};