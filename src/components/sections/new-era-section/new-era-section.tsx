import React, {useEffect, useRef} from 'react';
import { VideoAnalysisCard } from '../../cards/video-analysis-card/video-analysis-card';
import Desktop from "../../../assets/icons/Desktop.svg";
import Mobile from "../../../assets/icons/Mobile.svg";
import gsap from 'gsap';
import ScrollTrigger from "gsap/ScrollTrigger";

export interface NewEraSectionProps {
    className?: string;
}


export const NewEraSection: React.FC<NewEraSectionProps> = ({ className = '' }) => {
    const newEraRef = useRef(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        if (newEraRef.current) {
            gsap.timeline({
                    scrollTrigger: {
                        trigger: newEraRef.current,
                        start: "top 30%",
                        end: "+=200",
                        scrub: 0.5,
                        toggleActions: "restart pause pause pause"
                    }
                }
            ).fromTo(
                "#new-era-title",
                {opacity: 0, x:100},
                {opacity: 1, x:0},
            ).fromTo(
                "#new-era-subtitle",
                {opacity: 0},
                {opacity: 1}
            ).fromTo(
                "#new-era-sub-text",
                {opacity: 0},
                {opacity: 1}
            ).fromTo(
                "#new-era-sub-text-2",
                {opacity: 0},
                {opacity: 1}
            )
        }
    }, []);

    return <section ref={newEraRef} className={className + "container flex flex-col gap-5 min-h-[50vh] justify-center py-10"}>
        <p id={"new-era-title"} className="text-title text-white z-10">A brand new era...</p>
        <span id={"new-era-subtitle"} className="text-accent">Traditional methods are focused on longer form content. <span className={"font-bold text-primary"}>Because models don’t know
            tiktok’s format.</span></span>
        <div
            className="flex w-full sm:justify-evenly justify-center items-center gap-20 sm:gap-1">
            <VideoAnalysisCard src={Desktop} title="Traditional Videos" videoType="Horizontal Videos"
                               duration="11.7 minute" videosAYear="3.7 million"/>
            <VideoAnalysisCard src={Mobile} title="Short Formed Content" videoType="Vertical Videos"
                               duration="33.7 second" videosAYear="33.7 million"/>
        </div>
        <p id={"new-era-sub-text"} className="text-accent">We’ve had years of traditional videos, current models understand them unbelieveably
            well, they can’t comprehend TikToks. </p>
        <p id={"new-era-sub-text-2"} className="text-primary text-bold">ViraNova is capable of understanding tiktoks.</p>
    </section>
};