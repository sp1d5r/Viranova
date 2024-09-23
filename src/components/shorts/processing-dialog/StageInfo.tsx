import React, { useState } from 'react';
import { CheckCircle2, Loader2, Circle, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { ProcessingStage } from '../../../pages/Shorts';

export const formatDuration = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

interface StageInfoProps {
  stage: ProcessingStage;
}

export const StageInfo: React.FC<StageInfoProps> = ({ stage }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusIcon = () => {
    switch (stage.status) {
    case 'outdated':
        return <AlertTriangle className="text-yellow-500" />;
      case 'completed':
        return <CheckCircle2 className="text-green-500" />;
      case 'in-progress':
        return <Loader2 className="animate-spin text-blue-500" />;
      default:
        return <Circle className="text-gray-300" />;
    }
  };


  const getTimeTaken = () => {
    if (stage.status !== 'completed' || stage.requests.length === 0) return null;
    const lastRequest = stage.requests[stage.requests.length - 1];
    if (lastRequest.requestCreated && lastRequest.serverCompletedTimestamp) {
      return formatDuration(lastRequest.requestCreated.toDate(), lastRequest.serverCompletedTimestamp.toDate());
    }
    return null;
  };

  const getLatestProgress = () => {
    if (stage.requests.length === 0) return null;
    const latestRequest = stage.requests[stage.requests.length - 1];
    return latestRequest.progress || 0;
  };

  const getLatestLog = () => {
    if (stage.requests.length === 0) return null;
    const latestRequest = stage.requests[stage.requests.length - 1];
    if (latestRequest.logs && latestRequest.logs.length > 0) {
      const latestLog = latestRequest.logs[latestRequest.logs.length - 1];
      return `${latestLog.timestamp.toDate().toLocaleString()}: ${latestLog.message}`;
    }
    return null;
  };

  return (
    <div>
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`${
            stage.status === 'outdated' ? 'text-yellow-500' :
            stage.status === 'completed' ? 'text-green-500' : 
            stage.status === 'in-progress' ? 'text-blue-500' : 
            'text-gray-500'
          }`}>
            {stage.label}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">
            Requests: {stage.requests.length}
          </span>
          {getTimeTaken() && (
            <span className="text-sm text-gray-400">
              Time: {getTimeTaken()}
            </span>
          )}
          {isOpen ? <ChevronUp color='white' size={16} /> : <ChevronDown color='white' size={16} />}
        </div>
      </div>
      {isOpen && (
        <div className="mt-2 pl-6 text-white">
          <p className="text-sm">Progress: {getLatestProgress()}%</p>
          {getLatestLog() && (
            <p className="text-sm mt-1">Latest log: {getLatestLog()}</p>
          )}
          {stage.status === 'outdated' && (
            <p className="text-sm mt-1 text-yellow-500">This stage may be outdated due to changes in previous stages.</p>
          )}
        </div>
      )}
    </div>
  );
};