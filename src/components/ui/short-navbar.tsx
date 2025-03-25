import React, { useState } from "react";
import { Button } from "./button";
import { Sparkles, ChevronLeft, ChevronRight, TriangleAlert, ChevronDown, ChevronUp, CheckCircle2, Loader2, Circle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Card } from "./card";
import { CreditButton } from "./credit-button";
import { Label } from "./label";
import { Timestamp } from "firebase/firestore";
import { ShortRequest } from "../../types/collections/Request";
import { ShortRequestEndpoints } from "../../types/collections/Request";
import { Dialog, DialogTrigger, DialogContent, DialogClose, DialogTitle, DialogDescription } from "./dialog";

export interface StepConfig {
  value: string;
  title: string;
  description?: string;
  completed?: boolean;
  active?: boolean;
  icon?: React.ReactNode;
}

export interface ProcessingStage {
    id: string;
    label: string;
    creationEndpoint: ShortRequestEndpoints;
    endpoints: ShortRequestEndpoints[];
    requests: ShortRequest[];
    status: 'not-started' | 'in-progress' | 'completed' | 'outdated';
    lastUpdated: Timestamp | null;
    stepConfig: StepConfig;
  }

interface ShortVideoNavbarProps {
  title?: string;
  subtitle?: string;
  steps: StepConfig[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onBackClick?: () => void;
  onAutoGenerateClick?: () => void;
  stages: ProcessingStage[];
}

const ShortVideoNavbar: React.FC<ShortVideoNavbarProps> = ({
  title = "Short Video Creator",
  subtitle = "Create your short videos step by step",
  steps,
  currentStepIndex,
  stages,
  onStepChange,
  onBackClick = () => window.location.href = "/dashboard?tab=shorts",
  onAutoGenerateClick = () => {},
}) => {

    const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col bg-background mb-4">
      {/* Combined row with title, subtitle, and steps */}
      <div className="flex items-center justify-between p-4 flex-wrap"> {/* Added flex-wrap for mobile */}
        <div className="flex items-center space-x-4 w-full md:w-auto"> {/* Full width on mobile */}
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
        <div className="flex items-center p-2 w-full md:w-auto"> {/* Full width on mobile */}
          {steps.map((step, index) => (
            <React.Fragment key={step.value}>
              {/* Step Button */}
              <button
                className={`
                  relative flex items-center h-12 px-2 transition-colors
                  ${index <= currentStepIndex ? 'text-white' : 'text-gray-500'} 
                  ${index === currentStepIndex ? 'bg-transparent' : 'bg-transparent'}
                  hover:bg-gray-800
                `}
                onClick={() => onStepChange(index)}
                disabled={index > currentStepIndex + 1}
              >
                {/* Icon for the step */}
                <span className="mr-2">{step.icon}</span>
                
                {/* Show title only for the active step on larger screens */}
                <span className={`hidden md:block text-sm ${index === currentStepIndex ? 'block' : 'hidden'}`}>
                  {step.title}
                </span>
                
                {/* Green completion indicator dot */}
                {index < currentStepIndex && (
                  <div className="absolute w-2 h-2 rounded-full bg-green-500 -top-1 -right-1"></div>
                )}
                
                {/* Active step indicator */}
                {index === currentStepIndex && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500"></div>
                )}
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
        
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Auto Generate
            </Button>
          </DialogTrigger>
          <DialogContent className="text-white">
            <DialogTitle>Auto Generate</DialogTitle>
            <DialogDescription>
              Edit each component and select auto-generate from that point onwards.
            </DialogDescription>
            {stages.filter((elem) => elem.status !== 'not-started').map((stage) => (
              <div key={stage.id} className="flex items-center justify-between mb-2">
                {stage.status === 'completed' && <CheckCircle2 className="text-green-500" />}
                {stage.status === 'in-progress' && <Loader2 className="animate-spin text-gray-300" />}
                {stage.status === 'not-started' && <Circle className="text-gray-300" />}
                {stage.status === 'outdated' && <TriangleAlert className="text-yellow-300" />}
                <span className={`flex-grow px-2 ${
                  stage.status === 'completed' ? 'text-green-500' : 
                  stage.status === 'in-progress' ? 'text-gray-300' : 
                  'text-gray-500'
                }`}>
                  {stage.label}
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="icon" variant="secondary">
                      <Sparkles size={15} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 z-50">
                    <Card className="grid gap-4 p-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Confirm</h4>
                        <p className="text-sm text-muted-foreground">
                          You're going to redo auto-generation from {stage.label}. {stage.stepConfig.description}.
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <div className="grid grid-cols-2 items-center gap-4">
                          <Label htmlFor="width">Confirm AutoGenerate</Label>
                          <CreditButton
                            creditCost={20}
                            confirmationMessage={"You're auto-generating a video, we're expecting this to take 20 credits"}
                            onClick={() => {
                                // if (short_id) {
                                    // createShortRequest(
                                        //     short_id,
                                        //     stage.creationEndpoint,
                                        //     20,
                                        //     () => {},
                                        //     () => {},
                                        //     true
                                        // )
                                        // }
                                    }}
                            variant="secondary"
                          >
                            Generate
                          </CreditButton>
                        </div>
                      </div>
                    </Card>
                  </PopoverContent>
                </Popover>
              </div>
            ))}
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
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
