import React, {MouseEvent, ReactNode} from "react";
import {NavigationBar} from "../components/navigation-bar/navigation-bar";

export interface ScrollableLayoutProps {
    children: ReactNode;
}

export default function ScrollableLayout({children}: ScrollableLayoutProps){
    return (<div>
        <NavigationBar />
        {children}
    </div>)
}