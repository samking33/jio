/**
 * StepProgress.tsx
 *
 * Horizontal step tracker showing all 10 pipeline steps grouped by stage.
 * Lives inside the PipelineShell (sticky below navbar).
 * Each node is: idle (grey) | running (pulsing primary) | completed (green ✓) | error (red ✗)
 */

import React from "react";
import { T, STAGE_COLORS } from "../../utils/tokens";
import { usePipeline } from "../../hooks/usePipeline";
import type { PipelineStep } from "../../types/pipeline.types";

export function StepProgress() {
  const { state, STAGE_GROUPS, isPipelineDone } = usePipeline();
  const { steps, currentStepId } = state;

  return (
    <div style={{ padding: "10px 16px 14px" }}>
      {/* Stage labels row */}
      <div style={{ display: "flex", marginBottom: 6 }}>
        {STAGE_GROUPS.map(group => (
          <div
            key={group.id}
            style={{
              flex: group.steps.length,
              textAlign: "center",
              fontSize: "0.55rem", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "1px",
              color: group.color, borderBottom: `2px solid ${group.color}`,
              paddingBottom: 4,
            }}
          >
            {group.icon} {group.label}
          </div>
        ))}
      </div>

      {/* Steps row */}
      <div style={{ display: "flex", alignItems: "center", marginTop: 10 }}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <StepNode step={step} isCurrent={step.id === currentStepId} />
            {index < steps.length - 1 && (
              <Connector completed={step.status === "completed"} stageColor={STAGE_COLORS[step.stage]} />
            )}
          </React.Fragment>
        ))}
        {/* Final node: Overview */}
        {isPipelineDone && (
          <>
            <Connector completed stageColor={T.teal} />
            <OverviewNode />
          </>
        )}
      </div>

      {/* Step labels row */}
      <div style={{ display: "flex", marginTop: 6 }}>
        {steps.map(step => (
          <div
            key={step.id}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: "0.52rem",
              fontWeight: step.id === currentStepId ? 700 : 500,
              color: step.status === "completed"
                ? T.success
                : step.id === currentStepId
                  ? STAGE_COLORS[step.stage]
                  : T.textSm,
              lineHeight: 1.3,
              padding: "0 2px",
            }}
          >
            {step.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STEP NODE ───────────────────────────────────────────────────────────────
function StepNode({ step, isCurrent }: { step: PipelineStep; isCurrent: boolean }) {
  const stageColor = STAGE_COLORS[step.stage];

  let bg = "#e5e7eb";
  let content: React.ReactNode = <span style={{ fontSize: "0.65rem", fontWeight: 700, color: T.textSm }}>{step.id}</span>;
  let boxShadow = "none";
  let animation = "none";

  if (step.status === "completed") {
    bg = T.success;
    content = <span style={{ fontSize: "0.75rem", color: "#fff" }}>✓</span>;
  } else if (step.status === "running") {
    bg = stageColor;
    content = <SpinnerDot />;
    boxShadow = `0 0 0 4px ${stageColor}30`;
    animation = "pulse-ring 1.2s infinite";
  } else if (step.status === "error") {
    bg = T.danger;
    content = <span style={{ fontSize: "0.75rem", color: "#fff" }}>✗</span>;
  } else if (isCurrent) {
    bg = stageColor;
    content = <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#fff" }}>{step.id}</span>;
    boxShadow = `0 0 0 3px ${stageColor}30`;
  }

  return (
    <div
      style={{
        width: 28, height: 28, borderRadius: "50%",
        background: bg, display: "flex", alignItems: "center",
        justifyContent: "center", flexShrink: 0,
        boxShadow, transition: "all .3s",
        position: "relative", zIndex: 2,
      }}
    >
      {content}
    </div>
  );
}

// ─── CONNECTOR ───────────────────────────────────────────────────────────────
function Connector({ completed, stageColor }: { completed: boolean; stageColor: string }) {
  return (
    <div style={{ flex: 1, height: 3, background: "#e5e7eb", position: "relative", zIndex: 1 }}>
      <div style={{
        position: "absolute", inset: 0,
        background: stageColor,
        transformOrigin: "left",
        transform: `scaleX(${completed ? 1 : 0})`,
        transition: "transform .5s ease",
        borderRadius: 99,
      }} />
    </div>
  );
}

// ─── OVERVIEW FINAL NODE ─────────────────────────────────────────────────────
function OverviewNode() {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: "50%",
      background: T.teal, display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0,
    }}>
      <span style={{ fontSize: "0.7rem" }}>📊</span>
    </div>
  );
}

// ─── SPINNER DOT ─────────────────────────────────────────────────────────────
function SpinnerDot() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3" fill="none" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
