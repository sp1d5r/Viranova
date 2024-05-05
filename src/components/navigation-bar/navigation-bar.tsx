import './navigation-bar.css';
import React, { useState } from 'react';
import { Logo } from '../logo/logo';
import Notifications from "../../assets/icons/Notifications.svg";
import Cards from "../../assets/icons/Cards.svg";
import ChevronDown from "../../assets/icons/ChevronDown.svg";
import {useAuth} from "../../contexts/Authentication";
import {useNotificaiton} from "../../contexts/NotificationProvider";

interface ExpandedOption {
    title: string;
    description: string;
    link: string;
}

interface HoverableLinkProps {
    name: string;
    expandedOptions: ExpandedOption[];
    left: number;
}

export interface NavigationBarProps {
    className?: string;
}


const HoverableLink: React.FC<HoverableLinkProps> = ({ name, expandedOptions, left=0 }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="relative inline-block" // Adjust according to your layout
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex gap-2">
                <p className="text-center text-stone-50 text-base">{name}</p>
                <img src={ChevronDown} alt="" />
            </div>
            {isHovered && (
                <div 
                style={{left: left}}
                className={`absolute top-6 w-[50vw] min-h-[30vh] bg-black/30 p-2 shadow-lg z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 rounded backdrop-blur border border-white p-5`}>
                    {expandedOptions.map((option, index) => (
                        <a key={index} href={option.link} className="no-underline text-white w-[200px]">
                            <h3 className="font-bold text-primary mb-1 underline">{option.title}</h3>
                            <p className="text-sm">{option.description}</p>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

export const NavigationBar: React.FC<NavigationBarProps> = ({ className = '' }) => {
    const [menuExpanded, setMenuExpanded] = useState(false);
    const {authState, logout} = useAuth();
    const { showNotification } = useNotificaiton();

    return <div className="w-full flex sticky top-0 bg-background min-h-12 shadow justify-start items-center gap-[90px] inline-flex px-10 py-5 navigation-bar z-50">
        {
            menuExpanded && <div className={"absolute z-20 h-[100vh] w-[100vw] top-0 left-0 bg-background flex flex-col px-10 py-5 justify-between"}>
                <div className="flex justify-start min-h-[50px]">
                    <Logo />
                </div>

                <div className="border-t border-white w-[80vw]" />

                <div className="gap-5 flex flex-col justify-start py-5">
                    <p className="text-white"> Navigation options</p>
                    <HoverableLink expandedOptions={[{
                        title: "Research Paper",
                        description: "A link to the research papaer",
                        link: "/help"
                    }]} name="Research" left={-20} />
                    <HoverableLink expandedOptions={[]} name="About" left= {-100}/>
                    <p className={"text-center text-stone-50 text-base font-normal"}>Demo</p>
                </div>

                <div className={"flex flex-1 gap-5 justify-end items-center flex-col "}>
                    <div className="border-t border-white h-[10px] w-[80vw]" />
                    <div className="flex gap-2 w-full px-10">
                        <img src={Notifications} alt={"Notifications"} />
                        <p className="text-white">
                            Notifications
                        </p>
                    </div>
                    <a className="flex gap-2 w-full px-10" href="/settings" >
                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="square" stroke-linejoin="round" stroke-width="2" d="M10 19H5a1 1 0 0 1-1-1v-1a3 3 0 0 1 3-3h2m10 1a3 3 0 0 1-3 3m3-3a3 3 0 0 0-3-3m3 3h1m-4 3a3 3 0 0 1-3-3m3 3v1m-3-4a3 3 0 0 1 3-3m-3 3h-1m4-3v-1m-2.121 1.879-.707-.707m5.656 5.656-.707-.707m-4.242 0-.707.707m5.656-5.656-.707.707M12 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                        </svg>
                        <p className="text-white">
                            User Settings
                        </p>
                    </a>

                    { authState.isAuthenticated ?
                        <p onClick={() => {
                            logout(() => {
                                showNotification(
                                    "Signed Out",
                                    "You've successfully signed out, it might take a second to propagate",
                                    "success"
                                )},
                                () => {
                                    showNotification(
                                        "Failed to Sign Out",
                                        "I don't think this is possible... try refreshing.",
                                        "warning"
                                    )
                                }
                            )}}
                            className={"font-bold text-danger"}
                        >
                        Sign Out
                    </p> :<a href={"/authenticate"}>
                        <p className={"m-0 text-center text-stone-50 text-base font-normal"}>
                            Sign Up
                        </p>
                    </a>}
                    <div className={"w-full flex justify-center items-center border border-red-500 rounded-xl p-5 bg-red-400"} onClick={() => {setMenuExpanded(false)}}>
                        <p className={"text-white font-bold"}>
                            Close Menu
                        </p>
                    </div>
                </div>

            </div>
        }

        
        <div className="flex-1 flex justify-start md:flex-initial">
            <Logo />
        </div>
        <div className="border-l border-white h-12 w-[10px] hidden md:flex" />
        <div className="flex-1 gap-10 hidden md:flex">
            <HoverableLink expandedOptions={[{
                title: "Research Paper",
                description: "A link to the research papaer",
                link: "/help"
            }]} name="Research"  left={-30}/>
            <HoverableLink expandedOptions={[]} name="About" left={-100}/>
            <p className={"text-center text-stone-50 text-base font-normal"}>Demo</p>
        </div>

        <div className={"hidden md:flex gap-5 justify-center items-center "}>
            <div className="border-l border-white h-12 w-[10px]" />
            <img src={Notifications} alt={"Notifications"} />
            { authState.isAuthenticated && <a href="/settings">
                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true"
                     xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="square" stroke-linejoin="round" stroke-width="2"
                          d="M10 19H5a1 1 0 0 1-1-1v-1a3 3 0 0 1 3-3h2m10 1a3 3 0 0 1-3 3m3-3a3 3 0 0 0-3-3m3 3h1m-4 3a3 3 0 0 1-3-3m3 3v1m-3-4a3 3 0 0 1 3-3m-3 3h-1m4-3v-1m-2.121 1.879-.707-.707m5.656 5.656-.707-.707m-4.242 0-.707.707m5.656-5.656-.707.707M12 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </svg>
            </a>}
            { authState.isAuthenticated ?
                <p onClick={() => {
                    logout(() => {
                            showNotification(
                                "Signed Out",
                                "You've successfully signed out, it might take a second to propagate",
                                "success"
                            )},
                        () => {
                            showNotification(
                                "Failed to Sign Out",
                                "I don't think this is possible... try refreshing.",
                                "warning"
                            )
                        }
                    )}}
                   className={"font-bold text-danger"}
                >
                    Sign Out
                </p> :<a href={"/authenticate"}>
                    <p className={"m-0 text-center text-stone-50 text-base font-normal"}>
                        Sign Up
                    </p>
                </a>}
        </div>

        <div className={"flex md:hidden gap-5 justify-center items-center "} onClick={() => {setMenuExpanded(true)}}>
            <div className="border-l border-white h-12 w-[10px]" />
            <img src={Cards} alt={"menu"} className={"h-full"} />
        </div>
    </div>

};