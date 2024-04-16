import React, {useEffect, useRef} from 'react';
import PlaygroundBackground from '../assets/playground-assets/PlaygroundBackground.png';
import {TransparentNavigationBar} from '../components/navigation-bar/transparent-navigation-bar';
import {ExistingProjects} from '../components/playground/ExistingProjects';
import {CreateProject} from '../components/playground/CreateProject';
import LogoIcon from "../assets/logo/Scissors.svg";
import gsap from "gsap";

export default function PlaygroundPage() {
    const comp = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            let timeline = gsap.timeline();
            timeline.from(["#landingLogoIcon", "#landingLogoI", "#landingLogoR", "#landingLogoA", "#landingLogoN", "#landingLogoO", "#landingLogoV", "#landingLogoA2"], {
                opacity: 0,
                y: "+=30",
                stagger: 0.2
            }).from(["#landingSubText1", "#landingSubText2", "#landingSubText3"], {
                opacity:0,
                y: "-=10",
                stagger: 0.5
            }).to("#landingBackgroundScreen", {
                xPercent: "-100",
                duration: 0.3,
                delay:0.2
            })
        }, comp);

        return () => ctx.revert();

    }, []);

    return <div ref={comp} className={'relative w-full h-[100vh]'}>
        <TransparentNavigationBar />

        {/* Loading Page */}
        <div id="landingBackgroundScreen" className="absolute w-screen h-screen bg-background z-50 flex flex-col justify-center items-center gap-3">
            <span className='text-2xl text-white font-bold flex items-center justify-center gap-1'>
                <img id="landingLogoIcon" src={LogoIcon} alt="" className={"h-8 w-8"} />
                <span id="landingLogoI">I</span>
                <span id="landingLogoR">R</span>
                <span id="landingLogoA">A</span>
                <span id="landingLogoN" className="text-primary">N</span>
                <span id="landingLogoO" className="text-primary">O</span>
                <span id="landingLogoV" className="text-primary">V</span>
                <span id="landingLogoA2" className="text-primary">A</span>
            </span>
            <span className="text-white flex gap-2">
                <span id="landingSubText1">Automate Clipping.</span>
                <span id="landingSubText2">Drive Traffic.</span>
                <span id="landingSubText3" className="text-primary font-bold">Deliver Results</span>
            </span>

        </div>

        {/* New Project */}
        <div className={'w-full h-1/2 max-h-[700px] min-h-[500px] relative'}>
            <img
                src={PlaygroundBackground}
                alt={'Oh no... I didn\'t load :( '}
                className={'absolute h-full w-full object-cover -z-0'}
            />
            <CreateProject />
        </div>

        {/* Bottom Recently Used Cards */}
        <ExistingProjects />
    </div>
}