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
import {BentoGridFeatures} from "../components/sections/bento-grid-features/BentoGridFeatures";



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

    /*useEffect(() => {
        if (authState.isAuthenticated) {
            window.location.href = "/playground";
        }
    }, [authState]);*/


    return <ScrollableLayout className={"gap-2 bg-black"}>
        <HeroSection />
        <TracingBeam className={"relative flex gap-2 z-10 px-5 w-full"}>
            <div className={"flex flex-col gap-2 w-full"}>
                <BentoGridFeatures />
                <WhySection />
                {/*<NewEraSection />*/}
                <ContentDeliveryTools />
                <ReviewSection />
                <BentoGridDemo />
            </div>
        </TracingBeam>


        <div className="w-full my-8 z-50 p-4 text-center bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
            <h5 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Create Clips From Anywhere!</h5>
            <p className="mb-5 text-base text-gray-500 sm:text-lg dark:text-gray-400">Stay up-to-date with the latest research in video clipping!</p>
            <div className="items-center justify-center space-y-4 sm:flex sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">

            </div>
        </div>
    </ScrollableLayout>
}