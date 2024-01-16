import React from 'react';
import HeroAsset from "../../assets/landing-page-assets/HeroAsset.png";
import { PrimaryButton } from '../primary-button/primary-button';
import { SecondaryButton } from '../secondary-button/secondary-button';
import Mouse from "../../assets/icons/Mouse.svg";

export interface HeroSectionProps {
    className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ className = '' }) => (
    <div className={className + 'container bg-background text-accent w-full min-h-[80vh] flex gap-5 justify-center items-center md:flex-wrap-reverse  px-5 flex-col-reverse sm:flex-row container'  }>
        <div className={"h-full flex-1 min-w-[300px] flex flex-col gap-5"}>
            <h1 className={"text-title"}>
                <span>Go Viral on TikTok: Turn Lengthy Videos into: </span>
                <span>Snappy Hits</span>
            </h1>
            <p>
                Join the businesses working with us to improve engagement, increase retention and reduce time spent editing your videos!
            </p>
            <div className={"flex gap-3"}>
                <PrimaryButton text={"Get Started"} icon=""/>
                <SecondaryButton text={"Learn More"} icon=""/>
            </div>
            <div className={"flex gap-3 items-center"}>
                <img className={"h-[50px]"} src={Mouse} alt={"/"}/>
                <p>Scroll to Continue </p>
            </div>

        </div>
        <div className="relative flex-1 h-full min-w-[300px] flex flex-col gap-3 overflow-hidden rounded-full">
            <img className="w-full h-full object-cover rounded-full aspect-square border-2 border-background" src={HeroAsset} alt="Mask" />
        </div>
    </div>
);