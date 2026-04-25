/**
 * StepCard.tsx
 *
 * Wrapper rendered around every active step's content.
 * Shows:
 *  - Step number + label header with status badge
 *  - Stage breadcrumb
 *  - The step's children (content)
 *  - Footer with NextButton
 */

import React, { type ReactNode } from "react";
import { T, STAGE_COLORS } from "../../utils/tokens";
import { Panel, PanelHd, Badge } from "../common/ui";
import { NextButton } from "./NextButton";
import { usePipeline } from "../../hooks/usePipeline";
import type { StepStatus } from "../../types/pipeline.types";

interface StepCardProps {
  stepId:   number;
  children: ReactNode;
  onRun:    () => void;
  onNext:   () => void;
  runLabel?: string;
}

const STATUS_BADGE: Record<StepStatus, { label: string; variant: "neutral" | "warning" | "success" | "danger" }> = {
  idle:      { label: "Idle",      variant: "neutral"  },
  running:   { label: "Running…",  variant: "warning"  },
  completed: { label: "Completed", variant: "success"  },
  error:     { label: "Error",     variant: "danger"   },
};

export function StepCard({ stepId, children, onRun, onNext, runLabel }: StepCardProps) {
  const { getStep, getStageForStep, totalSteps } = usePipeline();
  const step  = getStep(stepId);
  const stage = getStageForStep(stepId);
  if (!step) return null;

  const sb    = STATUS_BADGE[step.status];
  const color = stage ? STAGE_COLORS[stage.id] : T.primary;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Step header bar */}
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 8, padding: "12px 16px",
        borderLeft: `4px solid ${color}`,
        boxShadow: T.shadow,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            {stage && (
              <>
                <span style={{ fontSize: "0.58rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".8px", color }}>{stage.icon} · {stage.label}</span>
                <span style={{ color: T.textSm, fontSize: "0.6rem" }}>›</span>
              </>
            )}
            <span style={{ fontSize: "0.6rem", fontWeight: 600, color: T.textSm }}>Step {step.id} of {totalSteps}</span>
          </div>
          {/* Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-flex", width: 24, height: 24, borderRadius: 6, alignItems: "center", justifyContent: "center", background: "#EEF4FF", color: T.primary, fontSize: "0.68rem", fontWeight: 800 }}>{step.icon}</span>
            <span style={{ fontSize: "0.95rem", fontWeight: 700, color: T.text }}>{step.label}</span>
            <Badge variant={sb.variant}>{sb.label}</Badge>
          </div>
          <div style={{ fontSize: "0.7rem", color: T.textMd, marginTop: 3 }}>{step.description}</div>
        </div>

        {/* Next / Run button */}
        <NextButton onRun={onRun} onNext={onNext} runLabel={runLabel} />
      </div>

      {/* Step content */}
      <div style={{ animation: "fadeIn .2s ease" }}>
        {children}
      </div>
    </div>
  );
}
