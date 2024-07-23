import React from 'react';
import BackgroundGradient from "../../../assets/landing-page-assets/BackgroundGradient.svg";
import DataDrivenComments from "../../../assets/landing-page-assets/data-driven/DataDrivenComments.png";

export interface DataDrivenVideosProps {

}

export const DataDrivenVideos: React.FC<DataDrivenVideosProps> = ({}) => {
  return <section className="relative my-6 w-[90%] m-auto">
    <img src={BackgroundGradient} alt="..." className="absolute top-0 left-0 w-full h-full z-0" />

    <div className="flex gap-8 items-center justify-between w-[100%] min-w-[300px] flex-wrap-reverse md:flex-nowrap">
      <img src={DataDrivenComments} alt="Data Driven Videos Methodology" className="w-[45%] min-w-[300px]"/>

      <div className="flex flex-col justify-center items-start w-[50%] min-w-[300px]">
        <p className="tracking-wide text-primary font-bold text-[10px]">DATA DRIVEN VIDEOS</p>
        <p className="text-subtitle my-0 text-white mb-2">The first AI model that listens to your audience </p>
        <p className="text-stone-500">
          Our AI platform allows you to to track how videos are being received by your
          audience and use that data to not only fine-tune the AI model but to also
          interact with the engagement from your audience.
        </p>
      </div>
    </div>

  </section>
}