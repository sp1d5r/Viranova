import React from 'react';

type StepProps = {
  label: string;
  isActive: boolean;
};

export const Step: React.FC<StepProps> = ({ label, isActive }) => {
  return (
    <div className={`step ${isActive ? 'active' : ''}`}>
      {label}
    </div>
  );
};

type StepperProps = {
  activeStep: number;
  onStepChange: (step: number) => void;
  children: React.ReactNode;
};

export const Stepper: React.FC<StepperProps> = ({ activeStep, onStepChange, children }) => {
  return (
    <div className="stepper">
      {React.Children.map(children, (child, index) => {
        return React.cloneElement(child as React.ReactElement, {
          isActive: index === activeStep,
        });
      })}
    </div>
  );
};

export default Stepper;