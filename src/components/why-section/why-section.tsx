import React from 'react';
import { HiddenBackgroundTitle } from '../hidden-background-title/hidden-background-title';

export interface WhySectionProps {
    className?: string;
}


export const WhySection: React.FC<WhySectionProps> = ({ className = '' }) => (
    <div className={className + "container flex flex-col gap-5 min-h-[80vh] justify-center"}>
        <HiddenBackgroundTitle />
        <p className="text-bold text-primary">Generating TikTok Clips is not hard.</p>
        <p className="text-accent">You need to generate funny clips that engage your viewers, this means you need to give your videos personality. This lets you build a fan base of paying customers.</p>
        <p className="text-accent">This will bring people back to you helping you build that fanbase.</p>
    </div>
);