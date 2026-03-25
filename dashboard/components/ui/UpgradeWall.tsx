'use client'

import { Zap, Star, Check, ArrowRight } from 'lucide-react'

const PLANS = [
  {
    name: 'Builder',
    price: '$29',
    period: '/mo',
    description: 'For indie hackers & early startups',
    features: ['Unlimited GEO scans', 'Up to 5 competitors per scan', 'Priority Actions', 'Score history & trends'],
    cta: 'Start Builder',
    url: 'https://www.creem.io/payment/prod_1dI5h87ZhzzodGpRrRSvbW',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '$79',
    period: '/mo',
    description: 'For teams serious about AI visibility',
    features: ['Everything in Builder', 'Weekly automated scans', 'Competitor alert emails', 'Priority support'],
    cta: 'Start Growth',
    url: 'https://www.creem.io/payment/prod_1Xl8T46dBXT2zWowehqoQf',
    highlight: true,
  },
]

export default function UpgradeWall() {
  return (
    <div className="p-8 max-w-3xl animate-fade-up">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/20 rounded-full px-4 py-1.5 mb-4">
          <Zap size={12} className="text-cyan-400" />
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Free scan used</span>
        </div>
        <h1 className="font-['Syne'] text-2xl font-bold text-white mb-2">
          Upgrade to keep scanning
        </h1>
        <p className="text-sm text-[#7a8fa6] max-w-sm mx-auto">
          You've used your free scan. Pick a plan to run unlimited scans and track your GEO visibility over time.
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border p-6 flex flex-col gap-5 transition-all ${
              plan.highlight
                ? 'border-cyan-400/40 bg-cyan-400/5 ring-1 ring-cyan-400/20'
                : 'border-[rgba(34,211,238,0.12)] bg-[#0a1120]'
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="flex items-center gap-1 bg-cyan-400 text-[#060b14] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  <Star size={9} /> Most Popular
                </span>
              </div>
            )}

            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-[#7a8fa6] mb-1">{plan.name}</div>
              <div className="flex items-end gap-1">
                <span className="font-['Syne'] text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-sm text-[#7a8fa6] mb-1">{plan.period}</span>
              </div>
              <p className="text-xs text-[#7a8fa6] mt-1">{plan.description}</p>
            </div>

            <ul className="space-y-2 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[#a0b4c8]">
                  <Check size={13} className="text-cyan-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <a
              href={plan.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
                plan.highlight
                  ? 'bg-cyan-400 hover:bg-cyan-300 text-[#060b14]'
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              }`}
            >
              {plan.cta} <ArrowRight size={14} />
            </a>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-[#3d5166] mt-6">
        Cancel anytime · Secure payment via Creem
      </p>
    </div>
  )
}
