/**
 * NextButton.tsx
 *
 * The primary action button for the pipeline wizard.
 * States:
 *  - "Run [Step Name]"  → step is idle / current, not yet run
 *  - Loading spinner    → step is running
 *  - "Next →"          → step completed, proceed to next
 *  - "Finish / View Dashboard" → last step done
 */

import React from "react";
import { T } from "../../utils/tokens";
import { Btn, Spinner } from "../common/ui";
import { usePipeline } from "../../hooks/usePipeline";

interface NextButtonProps {
  onRun:  () => void;  // triggers the current step's API call
  onNext: () => void;  // advances currentStepId
  runLabel?: string;   // override run button label
}

export function NextButton({ onRun, onNext, runLabel }: NextButtonProps) {
  const { currentStep, state, totalSteps } = usePipeline();
  if (!currentStep) return null;

  const isRunning   = currentStep.status === "running";
  const isCompleted = currentStep.status === "completed";
  const isError     = currentStep.status === "error";
  const isLast      = currentStep.id === totalSteps;
  const hilNeedsReview =
    currentStep.id === 8 &&
    currentStep.status === "completed" &&
    !state.pipelineData.hilResults?.allDecided;

  if (isRunning) {
    return (
      <Btn disabled style={{ minWidth: 160, justifyContent: "center" }}>
        <Spinner size={14} color="#fff" /> Running…
      </Btn>
    );
  }

  if (isCompleted) {
    if (hilNeedsReview) {
      return (
        <Btn disabled size="md" style={{ minWidth: 180, justifyContent: "center" }}>
          Review decisions in progress
        </Btn>
      );
    }
    return (
      <Btn onClick={onNext} size="md" style={{ minWidth: 160, justifyContent: "center", gap: 8 }}>
        {isLast ? "View Dashboard 📊" : "Next Step →"}
      </Btn>
    );
  }

  if (isError) {
    return (
      <div style={{ display: "flex", gap: 8 }}>
        <span style={{ fontSize: "0.72rem", color: T.danger, display: "flex", alignItems: "center", gap: 4 }}>
          ✗ Error — check logs
        </span>
        <Btn variant="secondary" onClick={onRun} size="md">
          Retry
        </Btn>
      </div>
    );
  }

  // idle — show Run button
  return (
    <Btn onClick={onRun} size="md" style={{ minWidth: 160, justifyContent: "center" }}>
      ▶ {runLabel ?? `Run: ${currentStep.label}`}
    </Btn>
  );
}
