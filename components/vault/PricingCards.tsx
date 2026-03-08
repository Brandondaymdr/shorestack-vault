'use client';

import { useState } from 'react';
import type { PlanType } from '@/types/vault';

interface PricingCardsProps {
  currentPlan: PlanType;
  onManageBilling: () => void;
}

const plans = [
  {
    id: 'individual' as PlanType,
    name: 'Individual',
    price: '$3.99',
    period: '/month',
    features: [
      '1 user login',
      'Unlimited vault items',
      '5 GB document storage',
      'AES-256 zero-knowledge encryption',
      'Password generator',
      'Audit activity log',
    ],
    cta: 'Get Started',
    priceKey: 'individual_monthly',
    highlight: true,
  },
  {
    id: 'team' as PlanType,
    name: 'Team',
    price: '$6.99',
    period: '/month',
    features: [
      'Up to 5 user logins',
      'Everything in Individual',
      '10 GB document storage',
      'Shared vaults',
      'Team management',
      'Admin controls',
    ],
    cta: 'Get Started',
    priceKey: 'team_monthly',
  },
  {
    id: 'custom' as PlanType,
    name: 'Custom',
    price: 'Contact Us',
    period: '',
    features: [
      'Unlimited users',
      'Unlimited storage',
      'Dedicated support',
      'Custom integrations',
      'SLA & compliance',
      'On-prem available',
    ],
    cta: 'Contact Sales',
    contactUrl: 'mailto:brandon@daysllc.com?subject=ShoreStack%20Vault%20Custom%20Plan',
  },
];

export default function PricingCards({ currentPlan, onManageBilling }: PricingCardsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(priceKey: string) {
    setLoading(priceKey);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start checkout');
      }
    } catch {
      alert('Failed to start checkout');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const isUpgrade = (currentPlan === 'individual' && plan.id === 'team');
          const isDowngrade = (currentPlan === 'team' && plan.id === 'individual') ||
            (currentPlan === 'custom');

          return (
            <div
              key={plan.id}
              className={`relative rounded-sm border p-5 ${
                plan.highlight
                  ? 'border-[#5fa8a0] bg-[#5fa8a0]/10'
                  : 'border-[#1b4965]/15 bg-white'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-2.5 left-4 rounded-full bg-[#5fa8a0] px-2.5 py-0.5 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}

              <h3 className="text-lg font-semibold text-[#1b4965]">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#1b4965]">{plan.price}</span>
                {plan.period && <span className="text-sm text-[#1b4965]/60">{plan.period}</span>}
              </div>

              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#1b4965]/70">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#5fa8a0]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full rounded-sm border border-[#1b4965]/15 px-4 py-2.5 text-sm font-medium text-[#1b4965]/60"
                  >
                    Current Plan
                  </button>
                ) : plan.contactUrl ? (
                  <a
                    href={plan.contactUrl}
                    className="block w-full rounded-sm border border-[#1b4965]/15 px-4 py-2.5 text-center text-sm font-medium text-[#1b4965]/70 hover:bg-[#1b4965]/5"
                  >
                    {plan.cta}
                  </a>
                ) : isDowngrade ? (
                  <button
                    onClick={onManageBilling}
                    className="w-full rounded-sm border border-[#1b4965]/15 px-4 py-2.5 text-sm font-medium text-[#1b4965]/70 hover:bg-[#1b4965]/5"
                  >
                    Manage Billing
                  </button>
                ) : (isUpgrade || !isCurrent) && plan.priceKey ? (
                  <button
                    onClick={() => handleUpgrade(plan.priceKey!)}
                    disabled={loading === plan.priceKey}
                    className={`w-full rounded-sm px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 ${
                      plan.highlight
                        ? 'bg-[#5fa8a0] hover:bg-[#4d8f87]'
                        : 'bg-[#1b4965]/40 hover:bg-[#1b4965]/50'
                    }`}
                  >
                    {loading === plan.priceKey ? 'Redirecting...' : plan.cta}
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {(currentPlan === 'individual' || currentPlan === 'team') && (
        <button
          onClick={onManageBilling}
          className="mt-2 text-sm text-[#5fa8a0] underline hover:text-[#4d8f87]"
        >
          Manage subscription &amp; billing in Stripe
        </button>
      )}
    </div>
  );
}
