import React from 'react';

interface StepperValue {
  title: string;
  details: string;
}

export interface StepperProps {
  steps: StepperValue[];
  currentStep: number;
  onStepClick: (value: number)=>void;
}

const Stepper:React.FC<StepperProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <ol className="items-center justify-evenly w-full space-y-4 sm:flex sm:space-x-8 sm:space-y-0 rtl:space-x-reverse my-2">
      {steps.map((step, index) => (
        <li
          key={index}
          className={`flex items-center space-x-2.5 rtl:space-x-reverse ${
            index< currentStep ? "text-emerald-600 dark:text-emerald-500" : index === currentStep ? 'text-blue-600 dark:text-blue-500' : 'text-gray-500 dark:text-gray-400'
          }`}
          onClick={() => onStepClick(index)}
        >
          <span
            className={`flex items-center justify-center w-8 h-8 border rounded-full shrink-0 ${
              index === currentStep ? 'border-blue-600 dark:border-blue-500' : 'border-gray-500 dark:border-gray-400'
            }`}
          >
            {index + 1}
          </span>
          <span>
            <h3 className="font-medium leading-tight">{step.title}</h3>
            <p className="text-sm">{step.details}</p>
          </span>
        </li>
      ))}
    </ol>
  );
};

export default Stepper;