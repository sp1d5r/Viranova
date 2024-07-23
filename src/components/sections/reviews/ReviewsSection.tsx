import React from "react";
import {InfiniteMovingCards} from "../../ui/infinite-moving-cards";

export interface ReviewSectionProps {
  className?: string
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({className=""}) => {
  const testimonials = [
    {
      quote:
        "This platform has revolutionized the way we create and distribute short-form content. The AI-driven clips are spot-on and have significantly boosted our engagement.",
      name: "Alex Johnson",
      title: "Content Strategist at MediaWorks",
    },
    {
      quote:
        "Thanks to this tool, we can now effortlessly generate high-quality clips from our lengthy webinars. It's a game-changer for our social media strategy!",
      name: "Sarah Lee",
      title: "Marketing Manager at TechGurus",
    },
    {
      quote:
        "The AI clipping tool has saved us countless hours. The analytics feedback loop ensures our content keeps getting better and resonates with our audience.",
      name: "David Smith",
      title: "Founder of StartupX",
    },
    {
      quote:
        "Using this platform, our video engagement on TikTok has skyrocketed. The tailored clips are exactly what our audience wants to see.",
      name: "Emily Chen",
      title: "Social Media Influencer",
    },
    {
      quote:
        "This service has streamlined our content creation process. The AI is incredibly accurate, and the insights have helped us refine our approach.",
      name: "Michael Brown",
      title: "CEO of DigitalWave",
    },
  ];



  return <section className={className + ' container flex flex-col gap-5   justify-start overflow-hidden relative'}>
    <span className="text-title text-white">Designed by us. <span className="text-primary">Created for you.</span></span>

    <InfiniteMovingCards
      items={testimonials}
      direction="right"
      speed="slow"
    />
</section>
}