import React, { useState, useCallback, FormEvent } from 'react';
import { Short } from "../../../../types/collections/Shorts";
import { Segment } from "../../../../types/collections/Segment";
import { TranscriptEditor } from './TranscriptEditor';
import FirebaseDatabaseService from "../../../../services/database/strategies/FirebaseFirestoreService";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";

export interface TranscriptTabProps {
  short: Short;
  shortId: string;
  segment: Segment;
}

export const TranscriptTab: React.FC<TranscriptTabProps> = ({ short, shortId, segment }) => {
  const [activeTab, setActiveTab] = useState<'title' | 'transcript'>('title');
  const [isUploading, setIsUploading] = useState(false);

  const TitleEditor: React.FC = () => {
    const [formState, setFormState] = useState({
      topTitle: short.short_title_top || '',
      bottomTitle: short.short_title_bottom || ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsUploading(true);
      const updatedTitles = {
        short_title_top: formState.topTitle,
        short_title_bottom: formState.bottomTitle
      };

      FirebaseDatabaseService.updateDocument(
        "shorts",
        shortId,
        updatedTitles,
        () => {
          console.log("Titles updated successfully");
          setIsUploading(false);
        },
        (error) => {
          console.error("Failed to update titles:", error);
          setIsUploading(false);
        }
      );
    }, [formState, shortId]);

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="topTitle" className="block text-sm font-medium text-gray-700">Top Title</label>
          <Input
            type="text"
            id="topTitle"
            name="topTitle"
            value={formState.topTitle}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-white"
          />
        </div>
        <div>
          <label htmlFor="bottomTitle" className="block text-sm font-medium text-gray-700">Bottom Title</label>
          <Input
            type="text"
            id="bottomTitle"
            name="bottomTitle"
            value={formState.bottomTitle}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-white"
          />
        </div>
        <Button
          type="submit"
          disabled={isUploading}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Save Titles'}
        </Button>
      </form>
    );
  };

  return (
    <div className="w-full">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <Button
            type="button"
            variant="ghost"
            className={`${
              activeTab === 'title'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('title')}
          >
            Video Title
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={`${
              activeTab === 'transcript'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('transcript')}
          >
            Transcript
          </Button>
        </nav>
      </div>

      <div className="mt-4">
        {activeTab === 'title' ? (
          <TitleEditor />
        ) : (
          <TranscriptEditor short={short} shortId={shortId} segment={segment} />
        )}
      </div>
    </div>
  );
};