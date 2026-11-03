// Sandbox only. Never enable live-money keys in this delivery.
export function stripeTestConfig() {
  if (process.env.PAYMENT_PROVIDER !== 'stripe') return null;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || !/^(sk|rk)_test_[A-Za-z0-9]+$/.test(secretKey)) throw new Error('Stripe de test non configuré : aucun paiement réel autorisé');
  const app = new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3005');
  if (app.protocol !== 'https:' && !(app.protocol === 'http:' && ['127.0.0.1','localhost'].includes(app.hostname))) throw new Error('Adresse de retour Stripe invalide');
  return {secretKey, appUrl:app.origin};
}
