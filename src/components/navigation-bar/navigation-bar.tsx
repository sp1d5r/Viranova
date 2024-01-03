import './navigation-bar.css';
import React from 'react';
import { Logo } from '../logo/logo';

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


const HoverableLink: React.FC<HoverableLinkProps> = ({name, expandedOptions}) => (
    <div className={""}>
        <p className={"text-center text-stone-50 text-base font-normal font-['Inter']"}>{name}</p>
    </div>
);

export const NavigationBar: React.FC<NavigationBarProps> = ({ className = '' }) => (
    <div className="w-full flex bg-background min-h-12 shadow justify-start items-center gap-[90px] inline-flex px-5 py-5">
        <div className="flex-initial">
            <Logo />
        </div>
        <div className="border-l border-white h-12 w-[10px]"/>
        <div className="flex flex-1 gap-10">
            <HoverableLink expandedOptions={[]} name="Research" />
            <HoverableLink expandedOptions={[]} name="About" />
            <p className={"text-center text-stone-50 text-base font-normal font-['Inter']"}>Demo</p>
        </div>
        <div className="border-l border-white h-12 w-[10px]"/>
        <div>
        
        </div>
        
        </div>
        
);