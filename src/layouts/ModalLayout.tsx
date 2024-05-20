import React, {ReactNode} from "react";
import GreenBackground from "../assets/playground-assets/PlaygroundBackground.png";
import {BackgroundBeams} from "../components/ui/background-beams";

export interface ModalLayoutProps {
    children: ReactNode
}

export const ModalLayout : React.FC<ModalLayoutProps> = ({children}) => {
    return <div className={"flex justify-center items-center w-[100vw] h-[100vh]"}>
        <BackgroundBeams />

        <div className={"z-10"}>
            {children}
        </div>
    </div>
}