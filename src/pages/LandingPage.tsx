import {HeroSection} from "../components/sections/hero-section/hero-section";
import {WhySection} from "../components/sections/why-section/why-section";
import {NewEraSection} from "../components/sections/new-era-section/new-era-section";
import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import ScrollableLayout from "../layouts/ScrollableLayout";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';



export default function LandingPage(){
    const progressBarRef = useRef<HTMLProgressElement>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const sections: HTMLElement[] = gsap.utils.toArray('section') as HTMLElement[];

        if (sections.length > 0) {
            // Assuming the first section is at the start, calculate its bottom.
            const firstSectionBottom = sections[0].offsetTop;


            const updateProgressBar = () => {
                const scrollFromTop = window.scrollY;
                const windowHeight = window.innerHeight;
                const docHeight = document.documentElement.scrollHeight;

                // Calculate total scrollable length after the first section
                const totalDocScrollLength = docHeight - windowHeight - firstSectionBottom;

                // Adjust the scroll position to start after the first section
                const adjustedScrollFromTop = Math.max(0, scrollFromTop - firstSectionBottom);

                // Calculate the progress based on adjusted scroll position
                const scrollPosition = adjustedScrollFromTop / totalDocScrollLength;
                setProgress(Math.min(100, scrollPosition * 100));
            };

            window.addEventListener('scroll', updateProgressBar);

            return () => window.removeEventListener('scroll', updateProgressBar);
        }
    }, []);


    return <ScrollableLayout>
        <HeroSection />
        <div className={"flex gap-2"}>
            <div className={"w-5 h-[80vh] bg-accent sticky top-32 mx-5 rounded-full border border-primary"}>
                <div style={{height: progress + "%"}}  className={"w-full bg-primary rounded-full"}/>
            </div>
            <div className={"flex flex-col gap-2 w-full"}>
                <WhySection />
                <NewEraSection />
            </div>
        </div>
    </ScrollableLayout>
}