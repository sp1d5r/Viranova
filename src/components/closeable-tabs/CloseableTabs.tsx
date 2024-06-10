import React, { useState } from 'react';

export interface Tab {
  title: string;
  content: React.ReactNode;
}

export interface ClosableTabsProps {
  tabs: Tab[];
}

export const ClosableTabs: React.FC<ClosableTabsProps> = ({ tabs }) => {
  const [hiddenStates, setHiddenStates] = useState<boolean[]>(tabs.map(() => true));

  const toggleTab = (index: number) => {
    setHiddenStates((prevState) =>
      prevState.map((hidden, i) => (i === index ? !hidden : hidden))
    );
  };

  return (
    <div className="flex flex-col w-full">
      {tabs.map((tab, index) => (
        <div key={index} className="mb-4">
          <h2>
            <button
              type="button"
              className="flex items-center justify-between w-full py-5 font-medium text-left rtl:text-right text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400"
              aria-expanded={!hiddenStates[index]}
              onClick={() => toggleTab(index)}
            >
              <span>{tab.title}</span>
              {!hiddenStates[index] ? (
                <svg className="w-3 h-3 rotate-180 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" d="M9 5 5 1 1 5" />
                </svg>
              ) : (
                <svg className="w-3 h-3 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" d="M9 1 5 5 1 1" />
                </svg>
              )}
            </button>
          </h2>
          <div hidden={hiddenStates[index]} className="py-5 border-b border-gray-200 dark:border-gray-700">
            {tab.content}
          </div>
        </div>
      ))}
    </div>
  );
};