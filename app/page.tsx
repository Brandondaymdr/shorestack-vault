'use client';

import Link from 'next/link';
import ShorestackLogo from '@/components/ui/ShorestackLogo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-sand text-[#1b4965]">
      {/* Navigation */}
      <nav className="border-b border-[#1b4965]/15">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShorestackLogo variant="horizontal" size="sm" />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/signup" className="text-sm font-medium text-[#5fa8a0] hover:text-[#4d8f87]">
              Sign Up
            </Link>
            <Link href="/login" className="text-sm font-medium text-[#1b4965] hover:text-[#1b4965]/70">
              Log In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b border-[#1b4965]/15 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-[#1b4965] mb-4">
            Your passwords. Locked down.
          </h1>
          <p className="text-lg text-[#1b4965]/70 mb-8">
            ShoreStack Vault keeps your passwords, documents, and sensitive data encrypted with zero-knowledge security. Only you can see your stuff.
          </p>
          <Link href="/signup" className="inline-block rounded-sm bg-[#5fa8a0] px-6 py-3 font-medium text-white transition-colors hover:bg-[#4d8f87]">
            Get Started
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-[#1b4965]/15 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold mb-12">Why ShoreStack Vault</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="rounded-sm border border-[#1b4965]/15 bg-white p-6">
              <h3 className="text-lg font-semibold mb-3">Zero-Knowledge Encryption</h3>
              <p className="text-[#1b4965]/70">
                Your data is encrypted on your device before it leaves. We can't see it. Nobody can.
              </p>
            </div>
            <div className="rounded-sm border border-[#1b4965]/15 bg-white p-6">
              <h3 className="text-lg font-semibold mb-3">Passwords, Cards, Notes & More</h3>
              <p className="text-[#1b4965]/70">
                Store logins, credit cards, secure notes, and identity documents — all in one vault.
              </p>
            </div>
            <div className="rounded-sm border border-[#1b4965]/15 bg-white p-6">
              <h3 className="text-lg font-semibold mb-3">Encrypted Documents</h3>
              <p className="text-[#1b4965]/70">
                Upload important files. They're encrypted before they hit our servers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-b border-[#1b4965]/15 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold mb-4">Simple pricing. No surprises.</h2>
          <p className="text-center text-[#1b4965]/70 mb-12 max-w-2xl mx-auto">
            Choose the plan that fits your needs. No free tier, no credit card tricks.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Individual */}
            <div className="rounded-sm border-2 border-[#5fa8a0] bg-white p-8">
              <h3 className="text-xl font-semibold mb-2">Individual</h3>
              <div className="text-3xl font-bold mb-1">$3.99</div>
              <div className="text-sm text-[#1b4965]/60 mb-6">/month</div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[#5fa8a0]">✓</span>
                  <span>1 user login</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5fa8a0]">✓</span>
                  <span>Unlimited vault items</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5fa8a0]">✓</span>
                  <span>5 GB document storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5fa8a0]">✓</span>
                  <span>AES-256 encryption</span>
                </li>
              </ul>
              <Link href="/signup" className="block w-full rounded-sm bg-[#5fa8a0] px-4 py-3 text-center font-medium text-white transition-colors hover:bg-[#4d8f87]">
                Get Started
              </Link>
            </div>

            {/* Team */}
            <div className="rounded-sm border border-[#1b4965]/15 bg-white p-8">
              <h3 className="text-xl font-semibold mb-2">Team</h3>
              <div className="text-3xl font-bold mb-1">$6.99</div>
              <div className="text-sm text-[#1b4965]/60 mb-6">/month</div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[#5fa8a0]">✓</span>
                  <span>Up to 5 users</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5fa8a0]">✓</span>
                  <span>Unlimited items</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5fa8a0]">✓</span>
                  <span>10 GB storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5fa8a0]">✓</span>
                  <span>Shared vaults</span>
                </li>
              </ul>
              <button className="block w-full rounded-sm border border-[#1b4965]/15 px-4 py-3 text-center font-medium text-[#1b4965] transition-colors hover:bg-[#1b4965]/5">
                Get Started
              </button>
            </div>

            {/* Custom */}
            <div className="rounded-sm border border-[#1b4965]/15 bg-white p-8">
              <h3 className="text-xl font-semibold mb-2">Custom</h3>
              <div className="text-3xl font-bold mb-1">Contact Us</div>
              <div className="text-sm text-[#1b4965]/60 mb-6">&nbsp;</div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[#5fa8a0]">✓</span>
                  <span>Unlimited users</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5fa8a0]">✓</span>
                  <span>Unlimited storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5fa8a0]">✓</span>
                  <span>Dedicated support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5fa8a0]">✓</span>
                  <span>SLA & compliance</span>
                </li>
              </ul>
              <a href="mailto:brandon@daysllc.com?subject=ShoreStack%20Vault%20Custom%20Plan" className="block w-full rounded-sm border border-[#1b4965]/15 px-4 py-3 text-center font-medium text-[#1b4965] transition-colors hover:bg-[#1b4965]/5">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1b4965]/15 px-6 py-12 bg-white">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShorestackLogo variant="mark" size="sm" />
              <div className="font-semibold text-[#1b4965]">shorestack</div>
            </div>
            <p className="text-sm text-[#1b4965]/60">Business tools that just make sense.</p>
          </div>
          <p className="text-sm text-[#1b4965]/60">
            Copyright 2026 Days Management LLC
          </p>
        </div>
      </footer>
    </div>
  );
}
