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
        <p id="why-section-1" className="text-primary text-subsubtitle font-bold">Generating TikTok clips is not hard.</p>
        <p id="why-section-2" className="text-white">
            Leverage AI in your content production to help you grow an audience and maintain a consistent theme.
        </p>
        <span id="why-section-3" className="text-white">
            Avoid <span className="text-primary">unoriginality strikes</span> with our export to capcut features.
            Integrating into your existing workflow!
        </span>
    </section>
};