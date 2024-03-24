import React, {useEffect, useRef, useState} from 'react';
import Desktop from "../../../assets/icons/Desktop.svg";
import gsap from "gsap";
import { nanoid } from 'nanoid';
import ScrollTrigger from "gsap/ScrollTrigger";

export interface VideoAnalysisCardProps {
    className?: string;
    src?: string;
    title?: string;
    videoType?: string;
    duration?: string;
    videosAYear?: string;
}

export const VideoAnalysisCard = ({ className = '', src = Desktop, title = "Traditional Videos", videoType = 'Horizontal Videos', duration = '11.7 minute', videosAYear = '3.7 million' }) => {
    const comp = useRef(null);
    const [ids, setIds] = useState({
        image: `id-${nanoid()}`, // Prefixing the ID
        texts: Array(4).fill(null).map(() => `id-${nanoid()}`), // Prefixing each ID
    });


    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        if (comp.current) {
            gsap.timeline({
                    scrollTrigger: {
                        trigger: comp.current,
                        start: "top 60%",
                        end: "+=50",
                        scrub: 0.5,
                        toggleActions: "restart pause pause pause"
                    }
                }
            ).fromTo(
                `#${ids.image}`,
                {opacity: 0, x:100},
                {opacity: 1, x:0},
            ).from(ids.texts.map(id => `#${id}`), {
                opacity: 0,
                y: "+=30",
                stagger: 0.1,
            }).to(ids.texts.map(id => `#${id}`), {
                opacity: 1,
                y: "0",
                stagger: 0.1,
            });
        }

    }, [ids]);

    return (
        <div ref={comp} className={className + " flex flex-col gap-5 w-[45%] sm:w-auto"}>
            <div className="flex flex-col justify-center items-center gap-2">
                <img id={ids.image} src={src} alt="w-[30vw] sm:w-auto"/>
                <p className="text-primary text-bold">{title}</p>
            </div>
            <ul className="text-accent gap-2">
                <li id={ids.texts[0]} className="text-accent">{videoType}</li>
                <li id={ids.texts[1]} className="text-accent">{duration} average video duration</li>
                <li id={ids.texts[2]} className="text-accent">{videosAYear} videos published a year</li>
            </ul>
        </div>
    );
};