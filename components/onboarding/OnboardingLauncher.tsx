"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import OnboardingWizard, {
  getOnboardingProgress,
  OnboardingProgress,
  setOnboardingProgress,
} from "./OnboardingWizard";

interface OnboardingLauncherProps {
  checklistStatus?: Partial<Record<"adaptive" | "phase" | "latency" | "history", boolean>>;
  className?: string;
}

const allStepsComplete = (progress: OnboardingProgress, checklist?: Partial<Record<string, boolean>>) => {
  const completed = new Set(progress.completed);
  const checklistComplete = checklist ?? {};
  return ["adaptive", "phase", "latency", "history"].every(
    (step) => completed.has(step as never) || checklistComplete[step] === true
  );
};

export default function OnboardingLauncher({ checklistStatus, className }: OnboardingLauncherProps) {
  const [open, setOpen] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const stored = getOnboardingProgress();
    setComplete(allStepsComplete(stored, checklistStatus));
    if (!stored.dismissed && !allStepsComplete(stored, checklistStatus)) {
      setOpen(true);
    }
  }, [checklistStatus]);

  useEffect(() => {
    const stored = getOnboardingProgress();
    if (open && stored.dismissed) {
      const updated = { ...stored, dismissed: false };
      setOnboardingProgress(updated);
    }
    if (!open) {
      const storedAfter = getOnboardingProgress();
      setComplete(allStepsComplete(storedAfter, checklistStatus));
    }
  }, [open, checklistStatus]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const stored = getOnboardingProgress();
  const hasInProgress = stored.completed.length > 0 && !allStepsComplete(stored, checklistStatus);

  return (
    <div className={className}>
      <div className="flex items-start gap-3 rounded-2xl border border-surface-800 bg-surface-900/70 p-4 shadow-brand-sm">
        <div className="flex-1 text-sm text-neutral-300">
          <p className="font-semibold text-neutral-50">Need help setting up Resonance?</p>
          <p className="mt-1 text-neutral-400">
            {complete
              ? "All onboarding steps are complete. You can review the wizard anytime."
              : hasInProgress
              ? "You have onboarding steps in progress. Resume the wizard to finish configuration."
              : "Launch the guided wizard to walk through adaptive mode, phase intake, latency feeds, and history."}
          </p>
          {!complete && (
            <p className="mt-2 text-xs text-neutral-500">
              Prefer docs? Visit the <Link href="/docs" className="text-brand-200 hover:text-brand-100">Resonance Field Guide</Link>.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleOpen}
          className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:opacity-90"
        >
          {complete ? "Review Wizard" : hasInProgress ? "Resume Setup" : "Launch Setup Wizard"}
        </button>
      </div>
      <OnboardingWizard open={open} onClose={handleClose} checklistStatus={checklistStatus} />
    </div>
  );
}
