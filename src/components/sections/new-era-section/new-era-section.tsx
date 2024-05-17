import React, {useEffect, useRef} from 'react';
import { VideoAnalysisCard } from '../../cards/video-analysis-card/video-analysis-card';
import Desktop from "../../../assets/icons/Desktop.svg";
import Mobile from "../../../assets/icons/Mobile.svg";
import gsap from 'gsap';
import ScrollTrigger from "gsap/ScrollTrigger";
import {Vortex} from "../../ui/vortex";
import {BorderButton} from "../../ui/moving-borders";

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
                        start: "top 70%",
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

    return <section ref={newEraRef} className={className + "relative container flex flex-col gap-5 min-h-[50vh] justify-center py-10 overflow-hidden"}>
        <div className="w-full bg-primary -left-5 mx-auto rounded-md h-[30rem] overflow-hidden">
            <Vortex
              className="flex items-center flex-col justify-center px-5 md:px-10 py-4 w-full h-full overflow-hidden border-primary border"
              baseHue={110}
            >
                <h2 className="text-white text-4xl md:text-6xl font-bold text-left">
                    A new era
                </h2>
                <p className="text-white text-text md:text-2xl max-w-xl mt-6 text-left">
                    Use AI to improve the output speed of your content delivery
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
                    <BorderButton className="">
                        Start Clipping
                    </BorderButton>
                    <button className="px-4 py-2  text-white ">Contact Team</button>
                </div>
            </Vortex>
        </div>
    </section>
};