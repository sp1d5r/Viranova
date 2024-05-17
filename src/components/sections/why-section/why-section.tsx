import React, {useEffect, useRef} from 'react';
import { HiddenBackgroundTitle } from '../../hidden-background-title/hidden-background-title';
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export interface WhySectionProps {
    className?: string;
}


export const WhySection: React.FC<WhySectionProps> = ({ className = '' }) => {
    const whySection = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        if (whySection.current) {
            gsap.timeline({
                    scrollTrigger: {
                        trigger: whySection.current,
                        start: "top 50%",
                        end: "+=300",
                        scrub: 0.5,
                        toggleActions: "restart pause pause pause"
                    }
                }
            ).fromTo(
                '#why-section-1',
                {x: +200, opacity:0},
                {x: 0, opacity:1}
            ).fromTo(
                ['#why-section-2', "#why-section-3"],
                {opacity: 0},
                {opacity: 1},
            )
        }
    }, []);


    return <section ref={whySection} className={className + "container flex flex-col gap-5 min-h-[40vh] justify-start overflow-hidden"}>
        <HiddenBackgroundTitle />
        <p id="why-section-1" className="font-light text-primary text-subtitle">Generating TikTok clips is not hard.</p>
        <p id="why-section-2" className="text-white">You need to generate funny clips that engage your viewers, this means you need to
            give your videos personality. This lets you build a fan base of paying customers.</p>
        <p id="why-section-3" className="text-white">This will bring people back to you helping you build that fanbase.</p>
    </section>
};