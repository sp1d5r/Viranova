import './toggle.css';
import React from 'react';

export interface ToggleProps {
    className?: string;
    active: boolean;
    toggle: () => void;
    name: string;
}

export const Toggle: React.FC<ToggleProps> = ({ className = '', active = true, toggle, name = 'select' }) => {
    if (active) {
        return <div onClick={toggle} className={"px-[25px] py-[10px] bg-accent rounded text-bold flex justify-center items-center"}>
            <p>{name}</p>
        </div>
    } else {
        return <div onClick={toggle} className={"px-[25px] py-[10px] border border-accent text-accent rounded flex justify-center items-center"}>
            <p>{name}</p>
        </div>
    }
};