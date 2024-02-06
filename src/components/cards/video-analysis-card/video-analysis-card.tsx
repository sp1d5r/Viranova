import React from 'react';
import Desktop from "../../../assets/icons/Desktop.svg";

export interface VideoAnalysisCardProps {
    className?: string;
    src?: string;
    title?: string;
    videoType?: string;
    duration?: string;
    videosAYear?: string;
}

export const VideoAnalysisCard: React.FC<VideoAnalysisCardProps> = ({ className = '', src=Desktop, title="Traditional Videos", videoType = 'Horizontal Videos', duration = '11.7 minute', videosAYear= '3.7 million'}) => (
    <div className={className + "flex flex-col gap-5"}>
        <div className="flex flex-col justify-center items-center gap-2">
            <img src={src} alt="" /> 
            <p className="text-primary text-bold">{title}</p>
        </div>
        <ul className="text-accent gap-2">
            <li className="text-accent">{videoType}</li>
            <li className="text-accent">{duration} average video duration</li>
            <li className="text-accent">{videosAYear} videos published a year</li>
        </ul>
        
    </div>
); 