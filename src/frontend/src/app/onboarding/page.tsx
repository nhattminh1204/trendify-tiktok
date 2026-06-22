"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Step = 1 | 2 | 3 | 4;

const NICHES = [
  { emoji: "🏋️", label: "Fitness",       value: "fitness" },
  { emoji: "🍳", label: "Cooking",        value: "cooking" },
  { emoji: "💻", label: "Tech",           value: "tech" },
  { emoji: "💄", label: "Beauty",         value: "beauty" },
  { emoji: "💰", label: "Finance",        value: "finance" },
  { emoji: "🎓", label: "Education",      value: "education" },
  { emoji: "🎭", label: "Entertainment",  value: "entertainment" },
  { emoji: "🎮", label: "Gaming",         value: "gaming" },
];

const STEP_LABELS = ["Welcome", "Connect TikTok", "Choose Niche", "Done"];

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {STEP_LABELS.map((label, idx) => {
        const step = (idx + 1) as Step;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                  done || active
                    ? "bg-brand-600 text-white"
                    : "bg-white border-2 border-gray-200 text-gray-400"
                )}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : step}
              </div>
              <span
                className={cn(
                  "text-[12px] mt-1 font-medium",
                  done ? "text-brand-600" : active ? "text-gray-900" : "text-gray-400"
                )}
              >
                {label}
              </span>
            </div>
            {idx < STEP_LABELS.length - 1 && (
              <div
                className={cn(
                  "w-16 h-0.5 mb-4 mx-1",
                  step < current ? "bg-brand-600" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Step1({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div className="text-center px-10 py-12">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-[28px] font-bold text-gray-900">Welcome to Trendify</h2>
      <p className="text-base text-gray-600 mt-3 max-w-sm mx-auto">
        Your AI-powered TikTok Creator OS is ready. Let's set things up in 3 quick steps.
      </p>
      <Button fullWidth size="lg" onClick={onNext} className="mt-8">
        Let's go →
      </Button>
      <button
        onClick={onSkip}
        className="block mx-auto mt-3 text-sm text-gray-400 hover:text-gray-600"
      >
        Skip setup
      </button>
    </div>
  );
}

type TikTokStatus = "idle" | "loading" | "success" | "error";

function Step2({ onNext }: { onNext: () => void }) {
  const [status, setStatus] = useState<TikTokStatus>("idle");

  const handleConnect = () => {
    setStatus("loading");
    setTimeout(() => setStatus("success"), 1500);
  };

  return (
    <div className="text-center px-10 py-12">
      <div className="text-[40px] mb-4">♪</div>
      <h2 className="text-2xl font-bold text-gray-900">Connect your TikTok account</h2>
      <p className="text-sm text-gray-600 mt-3 max-w-xs mx-auto">
        We'll use this to pull analytics, audience data, and trend performance.
      </p>

      <div className="mt-8">
        {status === "success" ? (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2 justify-center text-green-700">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="font-medium">@creator connected</span>
          </div>
        ) : (
          <Button fullWidth size="lg" loading={status === "loading"} onClick={handleConnect}>
            {status === "loading" ? "Connecting…" : "Connect TikTok"}
          </Button>
        )}
      </div>

      {status === "success" && (
        <Button fullWidth size="lg" onClick={onNext} className="mt-3">
          Continue →
        </Button>
      )}

      {status !== "success" && (
        <button
          onClick={onNext}
          className="block mx-auto mt-3 text-sm text-gray-400 hover:text-gray-600"
        >
          I'll connect later
        </button>
      )}
    </div>
  );
}

function Step3({ onNext }: { onNext: (niche: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="px-10 py-8">
      <h2 className="text-[22px] font-bold text-gray-900">What's your content niche?</h2>
      <p className="text-sm text-gray-500 mt-2 mb-6">
        We'll personalize trend recommendations for you.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {NICHES.map(({ emoji, label, value }) => (
          <button
            key={value}
            onClick={() => setSelected(value)}
            className={cn(
              "relative flex flex-col items-center gap-2 p-4 rounded-xl border text-center cursor-pointer transition-colors duration-150",
              selected === value
                ? "bg-brand-50 border-brand-500"
                : "bg-white border-gray-200 hover:border-gray-300"
            )}
          >
            {selected === value && (
              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand-600 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" />
              </span>
            )}
            <span className="text-[28px]">{emoji}</span>
            <span className="text-[13px] font-medium text-gray-700">{label}</span>
          </button>
        ))}
      </div>
      <Button
        fullWidth
        size="lg"
        disabled={!selected}
        onClick={() => selected && onNext(selected)}
        className="mt-6"
      >
        Continue →
      </Button>
    </div>
  );
}

function Step4({ niche }: { niche: string }) {
  const router = useRouter();
  const nicheLabel = NICHES.find((n) => n.value === niche)?.label ?? niche;
  return (
    <div className="text-center px-10 py-12">
      <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto" />
      <h2 className="text-[28px] font-bold text-gray-900 mt-4">You're all set!</h2>
      <p className="text-sm text-gray-600 mt-2">
        Your workspace is ready. Start exploring trending content opportunities.
      </p>

      <div className="grid grid-cols-3 gap-3 mt-6">
        {[
          { value: "1,240+", label: "Trends tracked" },
          { value: "3",      label: "AI models ready" },
          { value: nicheLabel, label: "Your niche" },
        ].map(({ value, label }) => (
          <div key={label} className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <Button fullWidth size="lg" onClick={() => router.push("/dashboard")} className="mt-6">
        Go to Dashboard →
      </Button>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [niche, setNiche] = useState("fitness");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[600px]">
        <StepIndicator current={step} />
        <div className="bg-white border border-gray-200 rounded-xl shadow-card">
          {step === 1 && (
            <Step1
              onNext={() => setStep(2)}
              onSkip={() => router.push("/dashboard")}
            />
          )}
          {step === 2 && <Step2 onNext={() => setStep(3)} />}
          {step === 3 && (
            <Step3
              onNext={(n) => {
                setNiche(n);
                setStep(4);
              }}
            />
          )}
          {step === 4 && <Step4 niche={niche} />}
        </div>
      </div>
    </div>
  );
}
