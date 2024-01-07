import React from 'react';
import GreenTick from "../../assets/icons/GreenTick.svg";
import BlackTick from "../../assets/icons/BlackTick.svg";
import { SecondaryButton } from '../secondary-button/secondary-button';
import { PrimaryButton } from '../primary-button/primary-button';

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
        return <div className={className + 'border border-accent text-accent w-[25%] min-w-[300px] rounded py-8 px-5 flex flex-col items-center justify-center gap-5 min-h-[350px] max-w-[200px]'}>
            
            <b>{planType}</b>
            <div className={"flex flex-col gap-1 items-center"}>
                <p className={"text-bold underline"}>£{price}/ {granularity === 'month' ? "Per Month" : "Per Year"}</p>
                <p>{subtext}</p>
            </div>
            <div className={"flex flex-col gap-1 items-center w-full"}>
                {features.map((elem, index) => {
                    return <PricingFeature feature={elem} cardType={cardType} key={index} />
                })}
            </div>
            <SecondaryButton text={"Get Started"}/>
        </div>
    } else {
        return <div className={className + 'bg-accent border border-accent text-background w-[25%] min-w-[300px] rounded py-8 px-5 flex flex-col items-center justify-center gap-5 min-h-[350px] max-w-[200px]'}>
            
            <b>{planType}</b>
            <div className={"flex flex-col gap-1 items-center"}>
                <p className={"text-bold underline"}>£{price}/ {granularity === 'month' ? "Per Month" : "Per Year"}</p>
                <p>{subtext}</p>
            </div>
            <div className={"flex flex-col gap-1 items-center w-full"}>
                {features.map((elem, index) => {
                    return <PricingFeature feature={elem} cardType={cardType} key={index} />
                })}
            </div>
            <PrimaryButton text={"Get Started"}/>
        </div>
    }
};