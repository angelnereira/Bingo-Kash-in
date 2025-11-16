import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY no está configurada')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

/**
 * Crea un Payment Intent para procesar un pago
 */
export async function createPaymentIntent(
  amount: number,
  userId: string,
  description?: string
) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convertir a centavos
    currency: 'usd',
    metadata: {
      userId,
      description: description || 'Recarga de saldo Kash-in',
    },
  })

  return paymentIntent
}

/**
 * Verifica un webhook de Stripe
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET no está configurada')
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}
