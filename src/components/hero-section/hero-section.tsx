import React from 'react';
import HeroAsset from "../../assets/landing-page-assets/HeroAsset.png";
import { PrimaryButton } from '../primary-button/primary-button';
import { SecondaryButton } from '../secondary-button/secondary-button';

export interface HeroSectionProps {
    className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ className = '' }) => (
    <div className={className + 'bg-background text-accent w-full h-full flex gap-5 justify-evenly items-center sm:flex-wrap-reverse'}>
        <div className={"w-[45%] h-full min-w-[300px] flex flex-col gap-3"}>
            <h1 className={"text-title"}>
                <span>Go Viral on TikTok: Turn Lengthy Videos into: </span>
                <span>Snappy Hits</span>
            </h1>
            <p>
                Join the businesses working with us to improve engagement, increase retention and reduce time spent editing your videos!
            </p>
            <div className={"flex gap-3"}>
                <PrimaryButton text={"Get Started"} />
                <SecondaryButton text={"Learn More"}/>
            </div>
        </div>
        <div className={"w-[45%] h-full min-w-[300px] flex flex-col gap-3 radial-background overflow-hidden rounded-full"}>
            <img className={"w-full"} src={HeroAsset} alt={"Mask"} />
        </div>
    </div>
);