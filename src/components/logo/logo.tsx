import './logo.css';
import React from 'react';
import LogoIcon from "../../assets/logo/Scissors.svg";
import { Logo as Logo0 } from './logo';

export interface LogoProps {
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '' }) => (
    <div className={className + 'text-2xl font-bold flex items-center justify-center gap-1'}>
        <img src={LogoIcon} alt="" className={"h-8 w-8"} />
        <span className={"text-text"}>Vira</span><span className="text-primary">Nova</span></div>
);