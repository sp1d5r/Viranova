import React from 'react';
import SpoilerAlert from "../../assets/landing-page-assets/SpoilerAlert.svg";

export interface HiddenBackgroundTitleProps {
    className?: string;
    title?: string;
}

export const HiddenBackgroundTitle: React.FC<HiddenBackgroundTitleProps> = ({ className = '', title="Your clips won’t slap if they’re shit" }) => (
    <div className={className + 'w-full relative  mt-10 sm:m-10 flex justify-center items-center '}>
        <img className="absolute -top-5 z-1" src={SpoilerAlert} alt="Spoiler alert"/>
        <p className="text-title text-center text-accent z-10">{title}</p>
    </div>
);