import React from 'react';
import { VideoAnalysisCard } from '../../cards/video-analysis-card/video-analysis-card';
import Desktop from "../../../assets/icons/Desktop.svg";
import Mobile from "../../../assets/icons/Mobile.svg";

export interface NewEraSectionProps {
    className?: string;
}


export const NewEraSection: React.FC<NewEraSectionProps> = ({ className = '' }) => (
    <div className={className + "container flex flex-col gap-5 min-h-[80vh] justify-center py-10"}>
        <p className="text-title text-accent z-10">A brand new era...</p>
        <p className="text-accent">Traditional methods are focused on longer form content. Because models don’t know tiktok’s format.</p>
        <div className="flex w-full sm:justify-evenly justify-center items-center flex-wrap sm:flex-no-wrap gap-20 sm:gap-1">
            <VideoAnalysisCard src={Desktop} title="Traditional Videos" videoType="Horizontal Videos" duration="11.7 minute" videosAYear="3.7 million"/>
            <VideoAnalysisCard src={Mobile} title="Short Formed Content" videoType="Vertical Videos" duration="33.7 second" videosAYear="33.7 million"/>
        </div>
        <p className="text-accent">We’ve had years of traditional videos, current models understand them unbelieveably well, they can’t comprehend TikToks.  </p>
        <p className="text-primary text-bold">ViraNova is capable of understanding tiktoks.</p>
    </div>
);