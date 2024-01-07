import React from 'react';

export interface PrimaryButtonProps {
    className?: string;
    text?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ className = '', text='Get Started' }) => (
   <button className={"flex px-[30px] py-[15px] bg-secondary border-white border rounded-[10px] justify-center items-center gap-3 inline-flex"}>
    <div className={"text-center text-white text-base font-normal font-['Inter']"}>{text}</div>
    </button>
);