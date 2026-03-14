import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export default stripe;

export async function createPaymentIntent({ amount, currency = 'usd', metadata = {} }) {
  return stripe.paymentIntents.create({
    amount, // in cents
    currency,
    metadata,
  });
}

export async function createCheckoutSession({ priceId, successUrl, cancelUrl, customerId }) {
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer: customerId,
  });
}

export function constructWebhookEvent(payload, signature) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}
