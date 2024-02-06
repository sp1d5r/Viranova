import React from 'react';

export interface QuickTurnaroundSectionProps {
    className?: string;
}

export const QuickTurnaroundSection: React.FC<QuickTurnaroundSectionProps> = ({ className = '' }) => (
    <div className={className + 'w-full min-h-[300px] bg-green-50'}>
        <p> Here</p>
    
    </div>
);