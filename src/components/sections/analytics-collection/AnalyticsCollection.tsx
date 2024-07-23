import React from 'react';
import BackgroundGradient from "../../../assets/landing-page-assets/BackgroundGradient.svg";
import AnalyticsTracking from "../../../assets/landing-page-assets/analytics-collection/AnalyticsTracking.svg";

export interface AnalyticsCollectionProps {

}

export const AnalyticsCollection: React.FC<AnalyticsCollectionProps> = ({}) => {
  return <section className="relative my-6 w-[90%] m-auto">
    <img src={BackgroundGradient} alt="..." className="absolute top-0 left-0 w-full h-full z-0" />

    <div className="flex gap-8 items-center justify-between w-[100%] min-w-[300px] flex-wrap md:flex-nowrap">
      <div className="flex flex-col justify-center items-start w-[50%] min-w-[300px]">
        <p className="tracking-wide text-primary font-bold text-[10px]">ANALYTICS COLLECTION</p>
        <p className="text-subtitle my-0 text-white mb-2">Follow the success of your TikTok videos automatically</p>
        <p className="text-stone-500">
          With our data-driven video analysis solution, you can easily pinpoint videos which are
          performing well on the TikTok algorithm. Automatically updating the model and providing
          insights of your audience.
        </p>
      </div>
      <img src={AnalyticsTracking} alt="Analytics Tracking Methodology" className="w-[45%] min-w-[300px]"/>
    </div>

  </section>
}