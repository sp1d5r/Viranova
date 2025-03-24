import React, {ReactNode} from "react";

export interface FocussedLayoutProps {
    children?: ReactNode
}
export default function FocussedLayout({children}: FocussedLayoutProps){
    return (<div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
            {children}
        </div>
    </div>)
}