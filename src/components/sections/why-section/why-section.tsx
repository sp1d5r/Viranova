import React, {useEffect, useRef} from 'react';
import { HiddenBackgroundTitle } from '../../hidden-background-title/hidden-background-title';
import CardBackground from '../../../assets/landing-page-assets/why/CardBackground.png';
import AnalyseChannels from '../../../assets/landing-page-assets/why/AnalyseChannels.png';
import DataCollection from '../../../assets/landing-page-assets/why/DataCollection.png';
import FinetuneSystem from '../../../assets/landing-page-assets/why/FintuneSystem.png';
import Database from '../../../assets/landing-page-assets/why/icons/Database.png';
import Future from '../../../assets/landing-page-assets/why/icons/Future.png';
import FuseSymbol from '../../../assets/landing-page-assets/why/icons/Fuse Symbol.png';
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


    return <section ref={whySection} className={className + "container flex flex-col gap-5 min-h-[20vh] justify-start overflow-hidden"}>
        <HiddenBackgroundTitle title="Not another automation tool - it's a living organism." />

        <div className="flex w-full items-center justify-center gap-3 mt-8 flex-wrap md:flex-nowrap">
            <div className="shadow rounded-xl shadow-white relative flex flex-col items-start justify-end w-[300px] h-[300px]">
                <img className="absolute w-full h-full z-0" src={CardBackground} alt={''} />
                <img className="absolute top-0 w-full ml-auto mt-4 z-0" src={AnalyseChannels} alt={''} />

                <div className="flex flex-col gap-2 items-start justify-center z-10 text-white p-6">
                    <div className="flex gap-2 items-center font-bold">
                        <img className="w-[15px] h-[15px]" src={Database} alt={''} />
                        <p>Analyse Channels</p>
                    </div>
                    <p className="text-sm">Collect data from specific channels to build your clipping empire.</p>
                </div>
            </div>
            <div className="shadow rounded-xl shadow-white relative flex flex-col items-start justify-end w-[300px] h-[300px]">
                <img className="absolute top-0 w-full h-full z-0" src={CardBackground} alt={''} />
                <img className="absolute top-0 w-full ml-auto mt-4 z-0" src={DataCollection} alt={''} />

                <div className="flex flex-col gap-2 items-start justify-center z-10 text-white p-6">
                    <div className="flex gap-2 items-center font-bold">
                        <img className="w-[15px] h-[15px]" src={Future} alt={''} />
                        <p>Data Collection Methods</p>
                    </div>
                    <p className="text-sm">Collect data with various levels of granularity most suited to you.</p>
                </div>

            </div>
            <div className="shadow rounded-xl shadow-white relative flex flex-col items-start justify-end w-[300px] h-[300px]">
                <img className="absolute w-full h-full z-0" src={CardBackground} alt={''} />
                <img className="absolute top-0 w-full ml-auto mt-4 z-0" src={FinetuneSystem} alt={''} />

                <div className="flex flex-col gap-2 items-start justify-center z-10 text-white p-6">
                    <div className="flex gap-2 items-center font-bold">
                        <img className="w-[15px] h-[15px]" src={FuseSymbol} alt={''} />
                        <p>Analyse Channels</p>
                    </div>
                    <p className="text-sm">Use data to automatically finetune every part of the system.</p>
                </div>
            </div>
        </div>

        <div className="flex w-full items-center justify-center gap-3 my-2  flex-wrap md:flex-nowrap">
            <div className="relative flex flex-col items-start justify-end w-[300px]">
                <div className="flex flex-col gap-2 items-start justify-center z-10 text-white ">
                    <div className="flex gap-2 items-center font-bold">
                        <img className="w-[15px] h-[15px]" src={Database} alt={''} />
                        <p>Clipping Methodology</p>
                    </div>
                    <p className="text-sm">Start with your original video, splitting this up by topic into segments, finally convert the segments into shorts.</p>
                </div>
            </div>
            <div className="relative flex flex-col items-start justify-end w-[300px]">
                <div className="flex flex-col gap-2 items-start justify-center z-10 text-white">
                    <div className="flex gap-2 items-center font-bold">
                        <img className="w-[15px] h-[15px]" src={Database} alt={''} />
                        <p>Short Generation</p>
                    </div>
                    <p className="text-sm">Use Large Language Models to come up with ideas for shorts based from comments and analytics</p>
                </div>
            </div>
            <div className="relative flex flex-col items-start justify-end w-[300px]">
                <div className="flex flex-col gap-2 items-start justify-center z-10 text-white">
                    <div className="flex gap-2 items-center font-bold">
                        <img className="w-[15px] h-[15px]" src={Database} alt={''} />
                        <p>Intelligent Visual Identification</p>
                    </div>
                    <p className="text-sm">Intelligently detect the most interesting parts of your videos visually using our advanced models.</p>
                </div>
            </div>
        </div>
    </section>
};