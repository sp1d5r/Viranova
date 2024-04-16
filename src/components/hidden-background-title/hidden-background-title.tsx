import React, { useRef, useLayoutEffect } from 'react';
import SpoilerAlert from "../../assets/landing-page-assets/SpoilerAlert.svg";
import ScrollTrigger from 'gsap/ScrollTrigger';
import gsap from 'gsap';

export interface HiddenBackgroundTitleProps {
    className?: string;
    title?: string;
}

export const HiddenBackgroundTitle: React.FC<HiddenBackgroundTitleProps> = ({ className = '', title = "Your clips won’t slap if they’re shit" }) => {
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const element = ref.current;
        if (element) {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: element,
                    start: "top 90%",
                    end: "bottom top",
                    scrub: true,
                    toggleActions: "restart pause reverse pause"
                }
            });

            // Move the title horizontally across the screen
            tl.fromTo(
              '#hidden-title',
              { opacity: 0 }, // Start from the right, not visible
              { opacity: 1, duration: 1 } // Move to center and fade in
            );

            // Optionally, manage how the spoiler image behaves
            tl.fromTo(
              '#hidden-text',
              { x: 0, opacity: 0.5 }, // Start position
              { x: -200, opacity: 1, duration: 1 }, // End position
              "<" // Start this animation at the same time as the title
            );
        }
    }, []);

    return (
      <div ref={ref} className={`${className} w-full relative mt-10 sm:mt-10 flex justify-start items-center text-white`}>
          <img id="hidden-text" className="absolute -top-12 z-1 w-[300vw] max-w-max" src={SpoilerAlert} alt="Spoiler alert" />
          <p id="hidden-title" className="text-title text-center z-10">{title}</p>
      </div>
    );
};
