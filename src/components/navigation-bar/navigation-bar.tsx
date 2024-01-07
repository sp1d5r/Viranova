import './navigation-bar.css';
import React, { useState } from 'react';
import { Logo } from '../logo/logo';
import Notifications from "../../assets/icons/Notifications.svg";
import Siren from "../../assets/icons/Siren.svg";

interface ExpandedOption {
    title: string;
    description: string;
    link: string;
}

interface HoverableLinkProps {
    name: string;
    expandedOptions: ExpandedOption[];
}

export interface NavigationBarProps {
    className?: string;
}


const HoverableLink: React.FC<HoverableLinkProps> = ({ name, expandedOptions }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="relative inline-block" // Adjust according to your layout
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <p className="text-center text-stone-50 text-base font-normal">{name}</p>
            {isHovered && (
                <div className="absolute left-0 w-full bg-white p-2 shadow-lg z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {expandedOptions.map((option, index) => (
                        <a key={index} href={option.link} className="no-underline text-black">
                            <h3 className="font-bold mb-1">{option.title}</h3>
                            <p className="text-sm">{option.description}</p>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};
export const NavigationBar: React.FC<NavigationBarProps> = ({ className = '' }) => (
    <div className="w-full flex bg-background min-h-12 shadow justify-start items-center gap-[90px] inline-flex px-10 py-5 navigation-bar">
        <div className="flex-initial">
            <Logo />
        </div>
        <div className="border-l border-white h-12 w-[10px]" />
        <div className="flex flex-1 gap-10">
            <HoverableLink expandedOptions={[{
                title: "Research Paper",
                description: "A link to the research papaer",
                link: "/help"
            }]} name="Research" />
            <HoverableLink expandedOptions={[]} name="About" />
            <p className={"text-center text-stone-50 text-base font-normal font-['Inter']"}>Demo</p>
        </div>

        <div className={"flex gap-5 justify-center items-center"}>
            <div className="border-l border-white h-12 w-[10px]" />
            <img src={Notifications} alt={"Notifications"} />
            <img src={Siren} alt={"Siren"} />
            <a href={"/sign-up"}>
                <p className={"m-0 text-center text-stone-50 text-base font-normal font-['Inter']"}>
                    Sign Up
                </p>
            </a>
        </div>

    </div>

);