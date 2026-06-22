"use client"

import Link from "next/link"
import { Check, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

const freePlanFeatures = [
  { label: "50 trend scans/month", included: true },
  { label: "1 TikTok account", included: true },
  { label: "10 content ideas", included: true },
  { label: "Basic analytics", included: true },
  { label: "AI Script Generator", included: false },
]

const proPlanFeatures = [
  { label: "Unlimited trend scans", included: true },
  { label: "3 TikTok accounts", included: true },
  { label: "Unlimited content ideas", included: true },
  { label: "Advanced analytics", included: true },
  { label: "AI Script Generator", included: true },
  { label: "AI Budget $50/mo", included: true },
  { label: "Learning Engine", included: true },
]

const enterprisePlanFeatures = [
  { label: "Everything in Pro", included: true },
  { label: "Unlimited accounts", included: true },
  { label: "Custom AI budget", included: true },
  { label: "Unlimited team members", included: true },
  { label: "Priority support", included: true },
]

const faqs = [
  {
    question: "Can I try Pro for free?",
    answer:
      "Yes, we offer a 14-day free trial on the Pro plan. No credit card required to start.",
  },
  {
    question: "How is AI budget calculated?",
    answer:
      "AI budget is based on tokens used across features like script generation, idea scoring, and trend analysis. You can monitor usage in Settings > AI Budget.",
  },
  {
    question: "Can I connect multiple TikTok accounts?",
    answer:
      "Pro plan supports up to 3 TikTok accounts. Enterprise plans support unlimited accounts for agencies and teams.",
  },
  {
    question: "What happens when I hit my AI budget?",
    answer:
      "AI features pause automatically until the next billing cycle. You can purchase additional budget from Settings > AI Budget at any time.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, cancel at any time from Settings > Billing. Your plan stays active until the end of the billing period.",
  },
]

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <li className="flex items-center gap-2 text-sm text-gray-700">
      {included ? (
        <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
      ) : (
        <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
      )}
      <span className={included ? "text-gray-700" : "text-gray-400"}>
        {label}
      </span>
    </li>
  )
}

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <header className="h-14 bg-white border-b border-gray-200">
        <div className="max-w-[1100px] mx-auto px-8 h-full flex items-center justify-between">
          <span className="text-[18px] font-bold text-gray-900">Trendify</span>
          <Link href="/login">
            <Button variant="secondary" size="sm">
              Sign in
            </Button>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1100px] mx-auto px-6">
        {/* Header */}
        <div className="text-center pt-16 pb-8">
          <h1 className="text-[36px] font-bold text-gray-900">
            Choose your plan
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Start free. Scale when you&apos;re ready.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className="text-sm font-medium text-gray-700">Monthly</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`w-[52px] h-7 rounded-full relative cursor-pointer transition-colors duration-200 ${
              isAnnual ? "bg-brand-500" : "bg-gray-200"
            }`}
            aria-label="Toggle billing period"
          >
            <span
              className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-all duration-200 shadow-sm ${
                isAnnual ? "left-[28px]" : "left-[4px]"
              }`}
            />
          </button>
          <span className="text-sm font-medium text-gray-700">
            Annual
          </span>
          <Badge variant="success" className="ml-1">
            Save 20%
          </Badge>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1000px] mx-auto">
          {/* Free */}
          <div className="rounded-xl border border-gray-200 p-7 bg-white">
            <h2 className="text-[22px] font-bold text-gray-900">Free</h2>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[36px] font-bold text-gray-900">$0</span>
              <span className="text-gray-500">/mo</span>
            </div>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              Perfect for getting started.
            </p>
            <ul className="flex flex-col gap-2.5">
              {freePlanFeatures.map((f) => (
                <FeatureRow key={f.label} {...f} />
              ))}
            </ul>
            <Link href="/register" className="block mt-6">
              <Button variant="secondary" fullWidth>
                Get started
              </Button>
            </Link>
          </div>

          {/* Pro */}
          <div className="relative rounded-xl border-2 border-brand-500 p-7 bg-white shadow-[0_4px_12px_rgba(99,102,241,0.15)]">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap">
              Most Popular
            </span>
            <h2 className="text-[22px] font-bold text-gray-900">Pro</h2>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[36px] font-bold text-gray-900">
                {isAnnual ? "$23" : "$29"}
              </span>
              <span className="text-gray-500">/mo</span>
              {isAnnual && (
                <span className="text-gray-400 text-sm line-through ml-1">
                  $29
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              Everything a serious creator needs.
            </p>
            <ul className="flex flex-col gap-2.5">
              {proPlanFeatures.map((f) => (
                <FeatureRow key={f.label} {...f} />
              ))}
            </ul>
            <Link href="/register" className="block mt-6">
              <Button variant="primary" fullWidth>
                Start Pro free trial
              </Button>
            </Link>
          </div>

          {/* Enterprise */}
          <div className="rounded-xl border border-gray-200 p-7 bg-white">
            <h2 className="text-[22px] font-bold text-gray-900">Enterprise</h2>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[36px] font-bold text-gray-900">
                Custom
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              For agencies and professional teams.
            </p>
            <ul className="flex flex-col gap-2.5">
              {enterprisePlanFeatures.map((f) => (
                <FeatureRow key={f.label} {...f} />
              ))}
            </ul>
            <Button variant="secondary" fullWidth className="mt-6">
              Contact sales
            </Button>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-[700px] mx-auto mt-16 mb-16">
          <h2 className="text-[22px] font-bold text-gray-900 text-center mb-8">
            Frequently asked questions
          </h2>
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-gray-100 py-4">
              <button
                className="w-full flex items-center justify-between cursor-pointer text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-[15px] font-medium text-gray-900">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === i && (
                <p className="text-sm text-gray-600 pt-3 pb-1">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
