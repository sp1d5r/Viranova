import React, {ReactNode} from "react";
import GreenBackground from "../assets/playground-assets/PlaygroundBackground.png";

export interface ModalLayoutProps {
    children: ReactNode
}

export const ModalLayout : React.FC<ModalLayoutProps> = ({children}) => {
    return <div className={"flex justify-center items-center w-[100vw] h-[100vh]"}>
        <img className={"w-[100vw] h-[100vh] object-cover absolute z-0"} src={GreenBackground} alt={"bg"}/>
        <div className={"z-10"}>
            {children}
        </div>
    </div>
}