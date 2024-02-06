import React from 'react';
import Cards from "../../assets/icons/Cards.svg";

export interface PlainButtonProps {
    className?: string;
    text?: string;
    textClassName?: string;
    icon?: string;
}

export const PlainButton: React.FC<PlainButtonProps> = ({ className = '', text='Get Started', textClassName='', icon=Cards}) => (
    <button className={className + "flex px-[10px] py-[7px] md:px[30px] md:py-[15px] rounded-[10px] justify-center items-center gap-3 inline-flex"}>
    {icon !== "" && <img src={icon} alt="icon" /> }
    <div className={textClassName}>{text}</div>
    </button>
);

