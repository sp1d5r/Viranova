import React from 'react';
import AvancedTechnology from '../../../assets/landing-page-assets/AdvancedTechnology.svg';
import {useAuth} from "../../../contexts/Authentication";
import { PinContainer } from "../../ui/3d-pin";

export interface SelfSupervisedLearningSectionProps {
  className?: string;
}

export const ContentDeliveryTools : React.FC<SelfSupervisedLearningSectionProps> = ({className}) => {

  return <section className={className + ' container flex flex-col gap-5   justify-start overflow-hidden relative'}>

    {/* Foreground */}
    <div className=' z-20 w-full flex flex-col gap-2'>

      {/* Title Section */}
      <h1 className='text-title text-white'>Content Delivery Tools </h1>
      <span className='text-white'>
      <a className='text-primary font-bold' href="/">Human Reinforcement Learning</a>
        {' '}
        is the foundation for high performing models... We leverage the metrics provided by the videos posted to
        update our model and provide a more tailored experience.
    </span>

      {/* Navigation Options */}
      <div className='flex flex-wrap gap-5 justify-center items-center text-white my-5'>
        <PinContainer
          title="/video-clipping"
          href="/authenticate"
        >
          <div className="flex basis-full flex-col p-4 tracking-tight text-slate-100/50 sm:basis-1/2 w-[15rem] h-[20rem] ">
            <h3 className="max-w-xs !pb-2 !m-0 font-bold  text-base text-slate-100">
              Video Clipping
            </h3>
            <div className="text-base !m-0 !p-0 font-normal">
            <span className="text-slate-500 ">
              Converting longer original content into clips for tiktok and youtube shorts.
            </span>
            </div>
            <div className="flex flex-1 w-full rounded-lg mt-4 bg-gradient-to-br from-emerald-500 via-accent to-emerald-500" />
          </div>
        </PinContainer>

        <PinContainer
          title="/data-collection"
          href="/authenticate"
        >
          <div className="flex basis-full flex-col p-4 tracking-tight text-slate-100/50 sm:basis-1/2 w-[15rem] h-[20rem] ">
            <h3 className="max-w-xs !pb-2 !m-0 font-bold  text-base text-slate-100">
              Data Collection
            </h3>
            <div className="text-base !m-0 !p-0 font-normal">
            <span className="text-slate-500 ">
              Use the data collected from posting your videos to improve the models performance.
            </span>
            </div>
            <div className="flex flex-1 w-full rounded-lg mt-4 bg-gradient-to-tr from-accent via-primary to-accent" />
          </div>
        </PinContainer>
      </div>

    </div>


  </section>
}