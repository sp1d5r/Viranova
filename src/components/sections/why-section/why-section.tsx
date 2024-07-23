import React, {useEffect, useRef} from 'react';
import { HiddenBackgroundTitle } from '../../hidden-background-title/hidden-background-title';
import CopyWrittenContent from '../../../assets/landing-page-assets/why/CopyWrittenContent.svg'
import ZeroAudienceEngagement from '../../../assets/landing-page-assets/why/ZeroAudienceEngagement.png'
import Boring from '../../../assets/landing-page-assets/why/Boring.svg'
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
        <div className="flex flex-wrap md:flex-nowrap items-end justify-evenly gap-4">
            <div className="flex flex-col flex-1 h-full gap-2 min-w-[250px] min-h-[300px]">
                <img src={CopyWrittenContent} alt="Copywritten content" className="h-[150px] ml-auto" />
                <div className="border-t border-white flex flex-col p-2  text-white h-[150px]">
                    <p className="text-subsubtitle">Copywritten Content</p>
                    <p>Just copying and pasting clips get’s you stuck on 200 views. </p>

                </div>
            </div>

            <div className="flex flex-col flex-1 h-full gap-2 min-w-[250px] min-h-[300px]">
                <img src={ZeroAudienceEngagement} alt="Copywritten content" className="h-[150px] m-auto" />
                <div className="border-t border-white flex flex-col p-2  text-white h-[150px]">
                    <p className="text-subsubtitle">Zero Audience Engagement</p>
                    <p>Without interacting with your audience you won’t be able to build a fanbase</p>
                </div>
            </div>


            <div className="flex flex-col flex-1 h-full gap-2 min-w-[250px] min-h-[300px]">
                <img src={Boring} alt="Copywritten content" className="h-[150px] m-auto" />
                <div className="border-t border-white flex flex-col p-2  text-white h-[150px]">
                    <p className="text-subsubtitle">It's Boring...</p>
                    <p>The videos you're creating are just boring... </p>
                </div>
            </div>


        </div>
    </section>
};