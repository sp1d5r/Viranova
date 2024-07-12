import './logo.css';
import React from 'react';
import LogoIcon from "../../assets/logo/Scissors.svg";

export interface LogoProps {
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '' }) => (
    <a href="/" className={className + 'text-2xl font-bold flex items-center justify-center'}>
        <img src={LogoIcon} alt="" className={"h-8 w-8"} />
        <span className={"text-text"}>IRA</span><span className="text-emerald-700">NOVA</span></a>
);