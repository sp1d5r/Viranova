import {HeroSection} from "../components/sections/hero-section/hero-section";
import {WhySection} from "../components/sections/why-section/why-section";
import {NewEraSection} from "../components/sections/new-era-section/new-era-section";
import React, {useEffect, useState} from "react";
import ScrollableLayout from "../layouts/ScrollableLayout";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    ContentDeliveryTools
} from "../components/sections/self-supervised-learning-section/ContentDeliveryTools";
import {useAuth} from "../contexts/Authentication";
import {TracingBeam} from "../components/ui/tracing-beam";
import {ReviewSection} from "../components/sections/reviews/ReviewsSection";
import {BentoGridDemo} from "../components/sections/bento-grid/BentoGridSection";



export default function LandingPage(){
    const [progress, setProgress] = useState(0);
    const {authState} = useAuth();

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

    useEffect(() => {
        if (authState.isAuthenticated) {
            window.location.href = "/playground";
        }
    }, [authState]);


    return <ScrollableLayout className={"gap-2"}>
        <HeroSection />
        <TracingBeam className={"relative flex gap-2 z-10 px-5 w-full"}>
            <div className={"flex flex-col gap-2 w-full  overflow-hidden"}>
                <WhySection />
                {/*<NewEraSection />*/}
                <ContentDeliveryTools />
                <ReviewSection />
                <BentoGridDemo />
            </div>
        </TracingBeam>
    </ScrollableLayout>
}