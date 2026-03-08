// ============================================
// ShoreStack Vault — Stripe Helpers
// ============================================

import Stripe from 'stripe';

// Lazy-init to avoid crashing at build time when env vars aren't set
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

// Price IDs — set these after creating products in Stripe Dashboard
export const PRICE_IDS = {
  individual_monthly: process.env.STRIPE_INDIVIDUAL_MONTHLY_PRICE_ID || '',
  individual_yearly: process.env.STRIPE_INDIVIDUAL_YEARLY_PRICE_ID || '',
  team_monthly: process.env.STRIPE_TEAM_MONTHLY_PRICE_ID || '',
  team_yearly: process.env.STRIPE_TEAM_YEARLY_PRICE_ID || '',
} as const;

export type PriceKey = keyof typeof PRICE_IDS;

// Map Stripe price IDs back to plan names
export function getPlanFromPriceId(priceId: string): 'individual' | 'team' | null {
  if (priceId === PRICE_IDS.individual_monthly || priceId === PRICE_IDS.individual_yearly) return 'individual';
  if (priceId === PRICE_IDS.team_monthly || priceId === PRICE_IDS.team_yearly) return 'team';
  return null;
}
