import './logo.css';
import React from 'react';
import LogoIcon from "../../assets/logo/Scissors.svg";

export interface LogoProps {
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '' }) => (
    <a href="/" className={className + 'flex font-semibold items-center justify-center'}>
        <img src={LogoIcon} alt="" className={"h-5 w-5"} />
        <span className={"text-text"}>ira</span><span className="text-primary">Nova</span></a>
);