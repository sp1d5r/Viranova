import React from 'react';
import GreenTick from "../../assets/icons/GreenTick.svg";
import BlackTick from "../../assets/icons/BlackTick.svg";
import { PlainButton } from '../plain-button/plain-button';
import { SecondaryButton } from '../secondary-button/secondary-button';

interface PricingFeature {
    available: boolean;
    featureDescription: string;
}

interface PricingFeatureProp {
    cardType?: "default" | "active",
    feature: PricingFeature
}

const PricingFeature: React.FC<PricingFeatureProp> = ({ cardType, feature }) => {
    if (cardType === "default") {
        return <div className={"flex gap-2 w-full"}>
            {feature.available ?
                <img src={GreenTick} alt={"You will get:"} /> :
                <img src={GreenTick} alt={"You will not get:"} />
            }
            <p>{feature.featureDescription}</p>
        </div>
    } else {
        return <div className={"flex gap-2 w-full"}>
            {feature.available ?
                <img src={BlackTick} alt={"You will get:"} /> :
                <img src={BlackTick} alt={"You will not get:"} />
            }
            <p>{feature.featureDescription}</p>
        </div>
    }
}

export interface PricingCardProps {
    className?: string;
    planType?: 'Basic' | 'Advanced' | 'Enterprise',
    cardType?: "default" | "active";
    granularity?: "month" | "year";
    price?: number;
    subtext?: string;
    features: PricingFeature[];
}

export const PricingCard: React.FC<PricingCardProps> = ({
    className = '',
    planType = 'Basic',
    cardType = 'default',
    granularity = 'month',
    price = 20,
    subtext = "Basic Features for 10 Users",
    features
}) => {

    if (cardType === 'default') {
        return <div className={className + 'border border-accent text-accent w-[27%] min-w-[250px] rounded py-8 px-5 flex flex-col items-center justify-center gap-5 min-h-[350px] max-h-[375px] max-w-[350px]'}>
            
            <b>{planType}</b>
            <div className={"flex flex-col gap-1 items-center"}>
                <p className={"text-bold underline"}>£{price}/ {granularity === 'month' ? "Per Month" : "Per Year"}</p>
                <p>{subtext}</p>
            </div>
            <div className={"flex flex-col gap-2 items-center w-full"}>
                {features.map((elem, index) => {
                    return <PricingFeature feature={elem} cardType={cardType} key={index} />
                })}
            </div>
            <SecondaryButton text={"Get Started"} icon=""/>
        </div>
    } else {
        return <div className={className + 'bg-accent border border-accent text-background w-[30%] min-w-[250px] rounded py-5 px-5 flex flex-col items-center justify-evenly gap-5 min-h-[400px]  max-w-[375px]'}>
            
            <b>{planType}</b>
            <div className={"flex flex-col gap-1 items-center"}>
                <p className={"text-bold underline"}>£{price}/ {granularity === 'month' ? "Per Month" : "Per Year"}</p>
                <p>{subtext}</p>
            </div>
            <div className={"flex flex-col gap-2 items-center w-full"}>
                {features.map((elem, index) => {
                    return <PricingFeature feature={elem} cardType={cardType} key={index} />
                })}
            </div>
            <PlainButton text={"Recommended for you"} className={"bg-background "} textClassName={"text-white"}/>
        </div>
    }
};