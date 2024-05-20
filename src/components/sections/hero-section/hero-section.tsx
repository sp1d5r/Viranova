import React from 'react';
import Background from "../../../assets/landing-page-assets/background.png";
import BackgroundMobile from "../../../assets/landing-page-assets/backgroundMobile.png";
import PeaceLeft from "../../../assets/landing-page-assets/PeaceFingersLeft.svg";
import PeaceRight from "../../../assets/landing-page-assets/PeaceFingersRight.svg";
import Underline from "../../../assets/landing-page-assets/underline.svg";
import DrivingVideo from "../../../assets/landing-page-assets/WatchingMovie.svg";
import BuildingBlocks from "../../../assets/landing-page-assets/BuildingBlocks.svg";
import LayingDown from "../../../assets/landing-page-assets/LayingDown.svg";
import Segmentation from "../../../assets/landing-page-assets/Segmentation.svg";
import {BorderButton} from "../../ui/moving-borders";
import {Vortex} from "../../ui/vortex";

export interface HeroSectionProps {
    className?: string;
}


export interface LandingCardProps {
    imageSrc: string;
    cardTitle: string;
    cardDescription: string;
}
const LandingCard : React.FC<LandingCardProps> = ({imageSrc, cardTitle, cardDescription}) => {
    return <div
        className={"flex-col bg-white/5 flex border-primary border h-72 backdrop-blur rounded-xl hover:scale-110 transition-all p-3 justify-center items-center  gap-3 hover:shadow hover:shadow-primary min-w-[150px] max-w-[250px]"}>
        <img src={imageSrc} alt={"landing card image"} className={"mix-blend-darken h-32 w-32 aspect-square"}/>
        <p className={"font-bold"}>{cardTitle}</p>
        <p>{cardDescription}</p>
    </div>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ className = '' }) => {
    const isMobile = window.innerWidth <= 450;

    return <Vortex
      baseHue={110}
        className={className + 'container  !p-0 text-white w-full  min-h-[80vh] flex gap-5 justify-center items-center md:flex-wrap-reverse  flex-col-reverse sm:flex-row container'}>
        <div className={"z-10 flex flex-col gap-10 justify-center items-center bg-background/70 px-5 pt-10"}>
            <div className={"flex justify-center items-center relative "}>
                <div className={"relative group"}>
                    <div
                        className={"absolute -inset-0.5 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg blur opacity-65 group-hover:-inset-1"}></div>
                    <div
                        className={"relative bg-background text-xl  px-5 py-2 rounded-xl group-hover:text-green-300 transition duration-200"}>
                        <p>
                            Powered by the Blockchain
                        </p>
                    </div>
                </div>
            </div>


            <div className={"flex gap-5 justify-center"}>
                <img className={"hidden md:flex h-20"} src={PeaceLeft} alt={"peace fingers left"}/>
                <div className={"flex flex-col gap-2"}>
                    <span className={"text-title m-0 text-center relative"}>
                        Block Chain Powered {" "}
                        <span className={"text-primary relative"}>
                            Computer Vision
                            <img className={"absolute right-0 -bottom-0.5"} src={Underline} alt={"_"}/>
                        </span>
                    </span>
                    <p>Step into a new era of business connections powered by AI, designed exclusively for the Web3
                        domain.</p>
                </div>
                <img className={"hidden md:flex h-20"} src={PeaceRight} alt={"peace fingers right"}/>
            </div>


            <div className=" hidden sm:grid grid-cols-2 sm:grid-cols-4 gap-5 justify-center">
                <LandingCard imageSrc={DrivingVideo} cardTitle={"Driving Video"}
                             cardDescription={"Provide the model with a driving video."}/>
                <LandingCard imageSrc={Segmentation} cardTitle={"Segmentation"}
                             cardDescription={"Perform Temporal and Spacial Segmentation."}/>
                <LandingCard imageSrc={LayingDown} cardTitle={"Metric Driven"}
                             cardDescription={"Fine-tune videos for your audience."}/>
                <LandingCard imageSrc={BuildingBlocks} cardTitle={"Blockchain Powered"}
                             cardDescription={"Inference and training powered by blockchain."}/>
            </div>

            <BorderButton duration={2000} onClick={() => {window.location.href="/playground"}}>
                <p className="text-white font-bold tracking-widest px-5">Begin Clipping!</p>
            </BorderButton>
            <p className={"text-secondary font-bold tracking-widest underline "}>Continue Scrolling</p>
        </div>
    </Vortex>
};