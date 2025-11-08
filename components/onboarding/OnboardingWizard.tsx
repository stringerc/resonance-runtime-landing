"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import Link from "next/link";

export const ONBOARDING_STORAGE_KEY = "resonance.onboarding.progress";

type StepKey = "adaptive" | "phase" | "latency" | "history";

interface StepConfig {
  key: StepKey;
  title: string;
  description: string;
  ctaLabel: string;
  docHref: string;
  checklistNote: string;
}

const STEPS: StepConfig[] = [
  {
    key: "adaptive",
    title: "Enable Adaptive Mode",
    description:
      "Confirm the agent is running with RESONANCE_MODE=adaptive so it can tune coupling automatically.",
    ctaLabel: "View deployment guide",
    docHref: "/docs/agent-setup",
    checklistNote: "Mode should report \"adaptive\" on Canary dashboard.",
  },
  {
    key: "phase",
    title: "Stream Phase Samples",
    description:
      "Feed real service traces via the bench harness or SDK so the controller can calculate R(t) and coherence.",
    ctaLabel: "Phase intake instructions",
    docHref: "/docs/phase-intake",
    checklistNote: "Target ≥ 100 phase samples for stable R(t).",
  },
  {
    key: "latency",
    title: "Send Latency Percentiles",
    description:
      "Provide p50/p95/p99 latency to unlock tail health and timing metrics.",
    ctaLabel: "Latency feed guide",
    docHref: "/docs/latency-feed",
    checklistNote: "Ensure p99 is streaming to populate tail analysis.",
  },
  {
    key: "history",
    title: "Build History",
    description:
      "Leave the dashboard open or keep traffic flowing so the agent can aggregate 24h of history for compliance charts.",
    ctaLabel: "History tips",
    docHref: "/docs/quickstart",
    checklistNote: "Band compliance stabilises after ~24h of samples.",
  },
];

export interface OnboardingProgress {
  completed: StepKey[];
  dismissed?: boolean;
}

const initialProgress: OnboardingProgress = { completed: [] };

export function getOnboardingProgress(): OnboardingProgress {
  if (typeof window === "undefined") return initialProgress;
  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return initialProgress;
    const parsed = JSON.parse(raw) as OnboardingProgress;
    if (!parsed || !Array.isArray(parsed.completed)) return initialProgress;
    return parsed;
  } catch (error) {
    console.warn("Failed to load onboarding progress", error);
    return initialProgress;
  }
}

export function setOnboardingProgress(progress: OnboardingProgress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn("Failed to persist onboarding progress", error);
  }
}

interface OnboardingWizardProps {
  open: boolean;
  onClose: () => void;
  checklistStatus?: Partial<Record<StepKey, boolean>>;
}

export default function OnboardingWizard({ open, onClose, checklistStatus = {} }: OnboardingWizardProps) {
  const [progress, setProgress] = useState<OnboardingProgress>(initialProgress);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const stored = getOnboardingProgress();
    setProgress(stored);
    if (stored.completed.length) {
      const nextIndex = STEPS.findIndex((step) => !stored.completed.includes(step.key));
      setActiveIndex(nextIndex >= 0 ? nextIndex : STEPS.length - 1);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const stored = getOnboardingProgress();
    setProgress(stored);
    const nextIndex = STEPS.findIndex((step) => !stored.completed.includes(step.key));
    setActiveIndex(nextIndex >= 0 ? nextIndex : STEPS.length - 1);
  }, [open]);

  const activeStep = STEPS[activeIndex];
  const completedSet = useMemo(() => new Set(progress.completed), [progress.completed]);

  const overallCompletion = useMemo(() => {
    const completedCount = STEPS.filter((step) => completedSet.has(step.key) || checklistStatus[step.key]).length;
    return Math.round((completedCount / STEPS.length) * 100);
  }, [completedSet, checklistStatus]);

  if (!open) return null;

  const markStepComplete = (stepKey: StepKey) => {
    if (completedSet.has(stepKey)) return;
    const updated = { ...progress, completed: [...progress.completed, stepKey] };
    setProgress(updated);
    setOnboardingProgress(updated);
  };

  const handleCompleteStep = () => {
    markStepComplete(activeStep.key);
    const nextIndex = STEPS.findIndex((step) => !completedSet.has(step.key) && step.key !== activeStep.key);
    if (nextIndex >= 0) {
      setActiveIndex(nextIndex);
    } else {
      setActiveIndex(STEPS.length - 1);
    }
  };

  const handleBack = () => {
    setActiveIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setActiveIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const isStepCompleted = (stepKey: StepKey) => completedSet.has(stepKey) || checklistStatus[stepKey];
  const isWizardComplete = STEPS.every((step) => isStepCompleted(step.key));

  const dismissWizard = () => {
    const updated = { ...progress, dismissed: true };
    setProgress(updated);
    setOnboardingProgress(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/80 backdrop-blur">
      <div className="relative w-full max-w-3xl rounded-3xl border border-surface-800 bg-surface-900/95 p-8 shadow-brand-md">
        <button
          type="button"
          onClick={dismissWizard}
          className="absolute right-4 top-4 text-neutral-400 transition hover:text-neutral-200"
          aria-label="Close onboarding wizard"
        >
          ×
        </button>

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="w-full rounded-2xl border border-surface-800 bg-surface-900/80 p-5 lg:w-56">
            <div className="mb-4 flex items-center justify-between text-xs text-neutral-500">
              <span>Progress</span>
              <span>{overallCompletion}%</span>
            </div>
            <div className="mb-6 h-2 overflow-hidden rounded-full bg-surface-800">
              <div
                className="h-full rounded-full bg-brand-400 transition-all duration-300"
                style={{ width: `${overallCompletion}%` }}
              />
            </div>

            <nav className="space-y-3 text-sm">
              {STEPS.map((step, index) => {
                const completed = isStepCompleted(step.key);
                const isActive = index === activeIndex;
                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={clsx(
                      "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition",
                      completed ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" :
                      isActive ? "border-brand-400/40 bg-surface-800 text-neutral-100" :
                      "border-surface-800 bg-surface-900/70 text-neutral-400 hover:border-brand-400/20 hover:text-neutral-100"
                    )}
                  >
                    <span>{step.title}</span>
                    {completed && <span className="text-xs">✓</span>}
                  </button>
                );
              })}
            </nav>
          </aside>

          <section className="flex-1 space-y-6">
            <header className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-brand-200">Step {activeIndex + 1} of {STEPS.length}</span>
              <h2 className="text-2xl font-semibold text-neutral-50">{activeStep.title}</h2>
              <p className="text-sm text-neutral-400">{activeStep.description}</p>
            </header>

            <div className="rounded-2xl border border-surface-800 bg-surface-900/70 p-5">
              <h3 className="text-sm font-semibold text-neutral-200">Resources</h3>
              <p className="mt-1 text-sm text-neutral-400">Use the docs and tools below to complete this step.</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href={activeStep.docHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-brand-400/40 bg-brand-500/10 px-4 py-2 text-sm font-semibold text-brand-200 transition hover:bg-brand-500/20"
                >
                  {activeStep.ctaLabel}
                </Link>
              </div>
              <p className="mt-3 text-xs text-neutral-500">{activeStep.checklistNote}</p>
            </div>

            <footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-neutral-500">
                {isWizardComplete ? "All steps complete! You can revisit this wizard anytime from the dashboard." :
                 isStepCompleted(activeStep.key) ? "Step marked complete." : "Mark this step complete once finished."}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={activeIndex === 0}
                  className="rounded-lg border border-surface-700 px-4 py-2 text-sm text-neutral-300 transition hover:border-brand-400/30 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Back
                </button>
                {!isStepCompleted(activeStep.key) && (
                  <button
                    type="button"
                    onClick={handleCompleteStep}
                    className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:opacity-90"
                  >
                    Mark Complete
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={activeIndex === STEPS.length - 1}
                  className="rounded-lg border border-brand-400/40 px-4 py-2 text-sm text-brand-200 transition hover:bg-surface-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </footer>
            {isWizardComplete && (
              <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                ✅ Onboarding complete! Keep the agent running to maintain history and watch for alerts in the dashboard insights panel.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
