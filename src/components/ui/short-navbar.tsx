import React from "react";
import { Button } from "./button";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

export interface StepConfig {
  value: string;
  title: string;
  description?: string;
  completed?: boolean;
  active?: boolean;
}

interface ShortVideoNavbarProps {
  title?: string;
  subtitle?: string;
  steps: StepConfig[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onBackClick?: () => void;
  onAutoGenerateClick?: () => void;
}

const ShortVideoNavbar: React.FC<ShortVideoNavbarProps> = ({
  title = "Short Video Creator",
  subtitle = "Create your short videos step by step",
  steps,
  currentStepIndex,
  onStepChange,
  onBackClick = () => window.location.href = "/dashboard?tab=shorts",
  onAutoGenerateClick = () => {},
}) => {
  return (
    <div className="flex flex-col bg-background mb-4">
      {/* Combined row with title, subtitle, and steps */}
      <div className="flex items-center justify-between p-4 "> {/* Full width for the top row */}
        <div className="flex items-center space-x-4">
          <Button
            onClick={onBackClick}
            variant="ghost"
            size="icon"
            className="rounded-full bg-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col"> {/* Title and subtitle in a column */}
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="text-sm text-gray-400">{subtitle}</p>
          </div>
        </div>

            {/* Steps navigation integrated into the same row */}
      <div className="flex items-center p-2">
        {steps.map((step, index) => (
          <React.Fragment key={step.value}>
            {/* Step Button */}
            <button
              className={`
                relative flex items-center h-12 px-4 transition-colors
                ${index <= currentStepIndex ? 'text-white' : 'text-gray-500'} 
                ${index === currentStepIndex ? 'bg-transparent' : 'bg-transparent'}
                hover:bg-gray-800
              `}
              onClick={() => onStepChange(index)}
              disabled={index > currentStepIndex + 1}
            >
              {/* Green completion indicator dot */}
              {index < currentStepIndex && (
                <div className="absolute w-2 h-2 rounded-full bg-green-500 -top-1 -right-1"></div>
              )}
              
              {/* Active step indicator */}
              {index === currentStepIndex && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500"></div>
              )}
              
              <span>{step.title}</span>
            </button>
            
            {/* Add chevron between steps (except after the last one) */}
            {index < steps.length - 1 && (
              <div className="flex items-center justify-center text-gray-500 px-1">
                <ChevronRight className="h-4 w-4" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      
        
        <Button 
          onClick={onAutoGenerateClick}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Auto Generate
        </Button>
      </div>
      {/* Progress bar that matches the active step */}
      <div className="w-full h-1 bg-gray-800 mt-2"> {/* Added margin-top for spacing */}
        <div 
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ShortVideoNavbar;
