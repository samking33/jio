/**
 * usePipeline.ts
 *
 * Thin convenience hook that re-exports everything from usePipelineCtx
 * plus exposes helper selectors so step components don't import context directly.
 */

import { usePipelineCtx, STAGE_GROUPS } from "../context/PipelineContext";
import type { PipelineStage, StageGroup } from "../types/pipeline.types";

export function usePipeline() {
  const ctx = usePipelineCtx();

  /** Returns true if a given stepId has been completed */
  function isStepDone(stepId: number): boolean {
    return ctx.getStep(stepId)?.status === "completed";
  }

  /** Returns true if a given stepId is currently running */
  function isStepRunning(stepId: number): boolean {
    return ctx.getStep(stepId)?.status === "running";
  }

  /** Returns all steps belonging to a given stage */
  function getStepsForStage(stage: PipelineStage) {
    return ctx.state.steps.filter(s => s.stage === stage);
  }

  /** Returns whether every step in a stage is completed */
  function isStageComplete(stage: PipelineStage): boolean {
    return getStepsForStage(stage).every(s => s.status === "completed");
  }

  /** Overall pipeline is done when every configured step is completed */
  const isPipelineDone = ctx.state.currentStepId > ctx.totalSteps;

  /** Pipeline has been started */
  const isPipelineStarted = ctx.state.currentStepId > 0;

  /** Stage progress 0–100 for a given stage */
  function stageProgress(stage: PipelineStage): number {
    const steps = getStepsForStage(stage);
    if (steps.length === 0) return 0;
    const done = steps.filter(s => s.status === "completed").length;
    return Math.round((done / steps.length) * 100);
  }

  return {
    ...ctx,
    STAGE_GROUPS,
    isStepDone,
    isStepRunning,
    getStepsForStage,
    isStageComplete,
    isPipelineDone,
    isPipelineStarted,
    stageProgress,
  };
}
