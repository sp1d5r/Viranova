import React, {useState} from 'react';
import { Toggle } from '../toggle/toggle';
import { PricingCard } from "../pricing-card/pricing-card";

export interface PricingSectionProps {
    className?: string;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ className = '' }) => {
    const [isMonthly, setMonthly] = useState(true);

    return <div className={className + "container flex flex-col gap-[30px]"}>
        <h1 className={"text-title m-0 text-accent w-full"}>We’ve got a strategy that’s ideal for you.</h1>
        <div className={"flex gap-3"}>
            <Toggle active={isMonthly} name={"Monthly"} toggle={() => {setMonthly(true)}}/>
            <Toggle active={!isMonthly} name={"Annually"} toggle={() => {setMonthly(false)}}/>
        </div>
        <div className={'bg-background w-full flex justify-start md:justify-center md:justify-evenly items-center gap-5 overflow-x-scroll'}>
                      <PricingCard
                          features={[
                              {available: true, featureDescription: "200 shorts per month"},
                              {available: true, featureDescription: "200 shorts per month"},
                          ]} />
                      <PricingCard
                          cardType={'active'}
                          features={[
                              {available: true, featureDescription: "200 shorts per month"},
                              {available: true, featureDescription: "200 shorts per month"},
                          ]} />
                      <PricingCard
                          features={[
                              {available: true, featureDescription: "200 shorts per month"},
                              {available: true, featureDescription: "200 shorts per month"},
                          ]} />
                  </div>
    </div>
};
