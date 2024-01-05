import React from 'react';

export interface SecondaryButtonProps {
    className?: string;
    text?: string;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({ className = '', text='Get Started'}) => (
    <button className={"flex px-[30px] py-[9px] bg-button-primary border-secondary border rounded-[10px] justify-center items-center gap-3 inline-flex"}>
    <div className={"text-center text-black text-base font-normal font-['Inter']"}>{text}</div>
    </button>
);