import { Timestamp } from "firebase/firestore";

export interface User {
  name: string,
  age: string,
  company: string,
  heardFrom: string,
  channelName: string,
  tiktokLink: string,
  primaryColor: string,
  secondaryColor: string,
  brandTheme: string[],
  tiktokConnected?: boolean,
  tiktokAccessCode?: string,
  tiktokLastAccessed?: Timestamp,
  clippingFor: 'self',
  subscription?: {
    status: 'active' | 'inactive' | 'canceled',
    tier: 'basic' | 'pro' | 'enterprise',
    startDate: Date,
    endDate: Date,
    lastPaymentDate: Date,
    stripeSubscriptionId: string,
  },
  credits?: {
    current: number,
    monthlyAllocation: number,
  },
  stripeCustomerId?: string,
}

export const SUBSCRIPTION_TIERS = {
  basic: {
    name: 'Basic',
    price: 20, // in GBP
    credits: 1000,
    shorts: 45,
    channels: 2,
    stripePriceId: 'price_1Psp3JGME0Qq6U11kubUqoBO',
  },
  pro: {
    name: 'Pro',
    price: 50, // in GBP
    credits: 3000,
    shorts: 45 * 3,
    channels: 6,
    stripePriceId: 'prod_QxLnUo8UDguJSG',
  },
  enterprise: {
    name: 'Enterprise',
    price: 100, // in GBP
    credits: 7000,
    shorts: 45 * 7,
    channels: 14,
    stripePriceId: 'prod_QxLoVQpsV4dS0d',
  },
};

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

export function getSubscriptionDetails(tier: SubscriptionTier) {
  return SUBSCRIPTION_TIERS[tier];
}