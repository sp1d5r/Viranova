import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Task } from "../../../types/collections/Task";

interface TaskTrackerProps {
  tasks: Task[];
}

const TaskTracker: React.FC<TaskTrackerProps> = ({ tasks }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'text-green-500';
      case 'Failed': return 'text-red-500';
      case 'Running': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {tasks.map(task => (
            <li key={task.id} className="flex justify-between items-center border-b pb-2">
              <span>{task.operation}</span>
              <span className={getStatusColor(task.status)}>{task.status}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default TaskTracker;