import React, {useEffect, useLayoutEffect, useRef} from 'react';
import SpoilerAlert from "../../assets/landing-page-assets/SpoilerAlert.svg";
import ScrollTrigger from 'gsap/ScrollTrigger';
import gsap from 'gsap'


export interface HiddenBackgroundTitleProps {
    className?: string;
    title?: string;
}

export const HiddenBackgroundTitle: React.FC<HiddenBackgroundTitleProps> = ({ className = '', title="Your clips won’t slap if they’re shit" }) => {
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const element = ref.current;
        if (element) {
            // Image slide up animation
            gsap.timeline({
                    scrollTrigger: {
                        trigger: element,
                        start: "top 70%",
                        end: "+=200",
                        scrub: 0.5,
                        toggleActions: "restart pause pause pause"
                    }
                }
            ).fromTo(
                '#hidden-text',
                {
                    y: +200,
                    opacity: 0,
                },
                {
                    y: 0,
                    opacity: 1,
                }
            ).fromTo(
                '#hidden-title',
                {opacity: 0},
                {opacity: 1}
            )
        }
    }, []);

    return <div ref={ref} className={className + 'w-full relative  mt-10 sm:m-10 flex justify-center items-center  text-white'}>
        <img id={"hidden-text"} className="absolute -top-5 z-1" src={SpoilerAlert} alt="Spoiler alert"/>
        <p id={"hidden-title"} className="text-title text-center z-10">{title}</p>
    </div>
};