import Stripe from 'stripe';

export type SuccessCallback<T> = (result: T) => void;
export type FailureCallback = (error: Error) => void;

interface PaymentService {
    createCustomer(
        data: object,
        onSuccess?: SuccessCallback<string>,
        onFailure?: FailureCallback
    ): Promise<void>;
    createCheckoutSession(
      priceId: string,
      stripeCustomerId: string,
      successUrl: string,
      cancelUrl: string,
      onSuccess?: SuccessCallback<string>,
      onFailure?: FailureCallback
    ): Promise<void>;
    createPaymentIntent(
        amount: number,
        currency: string,
        stripeCustomerId: string,
        onSuccess?: SuccessCallback<string>,
        onFailure?: FailureCallback
    ): Promise<void>;
    handleWebhookReceived(
        event: object,
        signature: string,
        secret: string
    ): void;
    createSubscription(
        customerId: string,
        planId: string,
        onSuccess?: SuccessCallback<string>,
        onFailure?: FailureCallback
    ): Promise<void>;
    listPaymentsForCustomer(
        customerId: string,
        onSuccess?: SuccessCallback<Stripe.PaymentIntent[]>,
        onFailure?: FailureCallback
    ): Promise<void>;
    createSetupIntent(
      customerId: string,
      onSuccess?: SuccessCallback<string>,
      onFailure?: FailureCallback,
    ): Promise<void>
}

export default PaymentService;
