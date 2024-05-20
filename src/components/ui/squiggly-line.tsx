import React, { useState } from "react";
import { motion } from "framer-motion";

type NavigationItem = {
  name: string;
}

export interface SquigglyLineProps {
  navigation: NavigationItem[]
  selectedLink: string;
  setSelectedLink: React.Dispatch<React.SetStateAction<string>>
}

export const SquigglyUnderline: React.FC<SquigglyLineProps> = ({navigation, setSelectedLink, selectedLink}) => {

  return (
    <div className="flex gap-5 sm:gap-16 w-full" >
      {navigation.map((item) => {
        const isSelected = item.name === selectedLink;
        return (
          <button
            key={item.name}
            className={`relative text-sm leading-6 no-underline ${
              isSelected ? "font-semibold text-white" : "text-gray-500"
            }`}
            onClick={() => setSelectedLink(item.name)}
          >
            {item.name}
            {isSelected ? (
              <motion.div className="absolute -bottom-[1px] left-0 right-0 h-[1px]">
                <svg width="37" height="8" viewBox="0 0 37 8" fill="none">
                  <motion.path
                    d="M1 5.39971C7.48565 -1.08593 6.44837 -0.12827 8.33643 6.47992C8.34809 6.52075 11.6019 2.72875 12.3422 2.33912C13.8991 1.5197 16.6594 2.96924 18.3734 2.96924C21.665 2.96924 23.1972 1.69759 26.745 2.78921C29.7551 3.71539 32.6954 3.7794 35.8368 3.7794"
                    stroke="#35DC32"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{
                      strokeDasharray: 84.20591735839844,
                      strokeDashoffset: 84.20591735839844,
                    }}
                    animate={{
                      strokeDashoffset: 0,
                    }}
                    transition={{
                      duration: 1,
                    }}
                  />
                </svg>
              </motion.div>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};


