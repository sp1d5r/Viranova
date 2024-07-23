import React from 'react';
import BackgroundGradient from '../../../assets/landing-page-assets/BackgroundGradient.svg';
import AiClipGen from '../../../assets/landing-page-assets/bento-grid/AiClipGen.svg';
import TikTokIllustration from '../../../assets/landing-page-assets/bento-grid/TikTokIllustration.svg';
import AIVideoAnalysis from '../../../assets/landing-page-assets/bento-grid/AIVideoAnalysis.png';
import PerformanceInsights from '../../../assets/landing-page-assets/bento-grid/PerformanceInsights.png';
import AIVideoGeneration from '../../../assets/landing-page-assets/bento-grid/AIVideoGeneration.png';
import InDepthAnalysis from '../../../assets/landing-page-assets/bento-grid/InDeptAnalysis.png';

export interface BentoGridFeaturesProps {

}

export const BentoGridFeatures: React.FC<BentoGridFeaturesProps> = () => {
  return <section className="relative my-6 w-[95%] m-auto text-center">
  <img src={BackgroundGradient} alt="..." className="absolute top-0 left-0 w-full h-full z-0" />

    <div className="z-10 flex flex-col gap-2 justify-center items-center text-left">
      <div className="flex flex-col gap-1 m-auto justify-center items-center">
        <div className="border border-primary shadow-accent p-2 rounded-full flex items-center justify-center w-[150px]">
          <p className="text-white">Features</p>
        </div>
        <p className="text-white text-title">The Future of Short-Form Content is Here</p>
        <p className="text-white">Viranova puts the power of AI to intelligently create content for your audience.</p>
      </div>

      {/* Bento Cards Here*/}
      <div className="flex gap-4 items-center justify-evenly w-full sm:h-auto md:h-[600px] z-10 flex-wrap md:flex-nowrap">
        {/* Bento First Column */}
        <div className="flex flex-col flex-1 h-full gap-2 min-w-[270px] min-h-[600px]">
          <div className="relative border border-primary/40 rounded-xl bg-emerald-950/40 flex flex-col p-4 items-start justify-end h-[60%] min-h-[360px]">
            <img src={AiClipGen} alt="..." className="absolute top-[10%] right-0 w-[80%] z-0" />
            <p className="text-subsubtitle text-white mb-1 z-10">AI Clip Generation</p>
            <p className="text-gray-500 z-10">Our system generates clips automatically using AI, creating viral clips that your audience will love!</p>
          </div>
          <div className="relative border border-primary/40 rounded-xl bg-emerald-950/40 flex flex-col p-4 items-start justify-end flex-grow overflow-hidden">
            <img src={TikTokIllustration} alt="..." className="absolute top-[10%] right-0 w-[80%] z-0" />
            <p className="text-subsubtitle text-white mb-1">Designed For</p>
          </div>
        </div>

        <div className="flex flex-col flex-1 h-full gap-2 min-w-[270px] min-h-[600px]">
          <div className="relative border border-primary/40 rounded-xl bg-emerald-950/40 flex flex-col p-4 items-start justify-end h-[50%] min-h-[300px]">
            <img src={AIVideoAnalysis} alt="..." className="absolute top-[10%]  -translate-x-1/2 left-1/2 w-[80%] z-0" />
            <p className="text-subsubtitle text-white mb-1">AI Video Analysis</p>
            <p className="text-gray-500">Our AI Analyses the success of each post to determine what your audience loves.</p>
          </div>
          <div className="relative border border-primary/40 rounded-xl bg-emerald-950/40 flex flex-col p-4 items-start justify-end flex-grow">
            <img src={PerformanceInsights} alt="..." className="absolute top-0  w-full left-0 z-0" />
            <p className="text-subsubtitle text-white mb-1">AI Performance Analysis</p>
            <p className="text-gray-500">Our platform automatically analyses the performance of each post and determines what your audience loves.</p>
          </div>
        </div>

        <div className="flex flex-col flex-1 h-full gap-2 min-w-[270px] min-h-[600px]">
          <div className="relative border border-primary/40 rounded-xl bg-emerald-950/40 flex flex-col p-4 items-start justify-end h-[70%] min-h-[420px]">
            <img src={AIVideoGeneration} alt="..." className="absolute top-[10%]  -translate-x-1/2 left-1/2 w-[80%] z-0" />
            <p className="text-subsubtitle text-white mb-1">AI Clip Generation</p>
            <p className="text-gray-500">Our system generates clips automatically using AI, creating viral clips that your audience will love!</p>
          </div>
          <div className="relative border border-primary/40 rounded-xl bg-emerald-950/40 flex flex-col p-4 items-start justify-end flex-grow">
            <img src={InDepthAnalysis} alt="..." className="absolute top-[10%] left-0 w-full z-0" />
            <p className="text-subsubtitle text-white mb-1 z-10">In-Depth Analysis</p>
          </div>
        </div>

      </div>

    </div>
  </section>
}