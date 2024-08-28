import Stripe from 'stripe';
import PaymentService, { SuccessCallback, FailureCallback } from '../PaymentInterface';

const apiKey = process.env.REACT_APP_STRIPE_API_KEY ? process.env.REACT_APP_STRIPE_API_KEY : '';

const stripe = new Stripe(apiKey, { apiVersion: '2024-06-20' });

const StripePaymentService: PaymentService = {
  async createCustomer(
    data: object,
    onSuccess?: SuccessCallback<string>,
    onFailure?: FailureCallback,
  ): Promise<void> {
    try {
      const customer = await stripe.customers.create(data);
      onSuccess?.(customer.id);
    } catch (error) {
      onFailure?.(error as Error);
    }
  },

  async createCheckoutSession(
    priceId: string,
    stripeCustomerId: string,
    successUrl: string,
    cancelUrl: string,
    onSuccess?: SuccessCallback<string>,
    onFailure?: FailureCallback,
  ): Promise<void> {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription', // Changed to 'subscription' for recurring payments
        customer: stripeCustomerId,
        line_items: [
          {
            price: priceId, // Use the priceId directly
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      onSuccess?.(session.url || '');
    } catch (error) {
      onFailure?.(error as Error);
    }
  },

  async createPaymentIntent(
    amount: number,
    currency: string,
    stripeCustomerId: string,
    onSuccess?: SuccessCallback<string>,
    onFailure?: FailureCallback,
  ): Promise<void> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        customer: stripeCustomerId,
        setup_future_usage: 'off_session', // This allows the payment method to be reused for future payments
      });
      onSuccess?.(paymentIntent.id);
    } catch (error) {
      onFailure?.(error as Error);
    }
  },

  handleWebhookReceived(
    event: object,
    signature: string,
    secret: string,
  ): void {
    const constructedEvent = stripe.webhooks.constructEvent(
      JSON.stringify(event),
      signature,
      secret,
    );

    console.log('Webhook received:', constructedEvent.type);
    // Here you would handle different event types with a switch statement or similar logic
  },

  async createSubscription(
    customerId: string,
    planId: string,
    onSuccess?: SuccessCallback<string>,
    onFailure?: FailureCallback,
  ): Promise<void> {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ plan: planId }],
      });
      onSuccess?.(subscription.id);
    } catch (error) {
      onFailure?.(error as Error);
    }
  },

  async listPaymentsForCustomer(
    customerId: string,
    onSuccess?: SuccessCallback<Stripe.PaymentIntent[]>,
    onFailure?: FailureCallback,
  ): Promise<void> {
    try {
      const paymentIntents = await stripe.paymentIntents.list({
        customer: customerId,
        // You can add more filters here if needed, like limiting by date or status
      });
      onSuccess?.(paymentIntents.data);
    } catch (error) {
      console.error('Failed to fetch payment intents:', error);
      onFailure?.(error as Error);
    }
  },

  async createSetupIntent(
    customerId: string,
    onSuccess?: SuccessCallback<string>,
    onFailure?: FailureCallback,
  ): Promise<void> {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
      });
      onSuccess?.(setupIntent.client_secret!);
    } catch (error) {
      onFailure?.(error as Error);
    }
  },
};

export default StripePaymentService;
