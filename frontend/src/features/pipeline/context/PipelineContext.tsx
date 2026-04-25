import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  createPipelineRun,
  executePipelineStep,
  getLatestPipelineRun,
  getPipelineRun,
} from "../services/api";
import type {
  PipelineRunState,
  PipelineStage,
  PipelineState,
  PipelineStep,
  StageGroup,
} from "../types/pipeline.types";
import { T } from "../utils/tokens";

const INITIAL_STEPS: PipelineStep[] = [
  { id: 1, key: "crawl", label: "Crawl Activity", description: "Scan approved source URLs and log listings, pass counts, discards, and errors", stage: "discovery", apiEndpoint: "", icon: "01", status: "idle" },
  { id: 2, key: "filter", label: "Rule Decisions", description: "Evaluate keyword, category, geography, value, deadline, and eligibility filters", stage: "discovery", apiEndpoint: "", icon: "02", status: "idle" },
  { id: 3, key: "download", label: "Document Intake", description: "Acquire supported RFP documents and preserve processing traceability", stage: "discovery", apiEndpoint: "", icon: "03", status: "idle" },
  { id: 4, key: "extract", label: "Tasks & Skills", description: "Decompose scope into tasks, skill needs, experience levels, and confidence scores", stage: "analysis", apiEndpoint: "", icon: "04", status: "idle" },
  { id: 5, key: "certs", label: "Certifications", description: "Map certification requirements and flag unknown taxonomy items for validation", stage: "analysis", apiEndpoint: "", icon: "05", status: "idle" },
  { id: 6, key: "risk", label: "Eligibility & Risk", description: "Assess eligibility, supporting evidence, gaps, mitigations, and delivery risks", stage: "analysis", apiEndpoint: "", icon: "06", status: "idle" },
  { id: 7, key: "convert", label: "Schema Package", description: "Package structured JSON output for controlled downstream consumption", stage: "decision", apiEndpoint: "", icon: "07", status: "idle" },
  { id: 8, key: "hil", label: "HIL Review", description: "Require manager review, corrections, rejection, or confirmation before handoff", stage: "decision", apiEndpoint: "", icon: "08", status: "idle" },
  { id: 9, key: "forward", label: "Approved Handoff", description: "Forward only confirmed RFP packages to downstream bid modules", stage: "decision", apiEndpoint: "", icon: "09", status: "idle" },
  { id: 10, key: "log", label: "Audit & Feedback", description: "Store audit trail, corrections, confidence metrics, and feedback loop signals", stage: "feedback", apiEndpoint: "", icon: "10", status: "idle" },
];

const INITIAL_STATE: PipelineState = {
  currentStepId: 0,
  steps: INITIAL_STEPS,
  pipelineData: {},
  isRunning: false,
};

export const STAGE_GROUPS: StageGroup[] = [
  { id: "discovery", label: "Discovery", icon: "Discovery", color: T.primary, steps: [1, 2, 3] },
  { id: "analysis", label: "Analysis", icon: "Analysis", color: T.violet, steps: [4, 5, 6] },
  { id: "decision", label: "Decision", icon: "Decision", color: T.warning, steps: [7, 8, 9] },
  { id: "feedback", label: "Feedback", icon: "Feedback", color: T.teal, steps: [10] },
];

interface PipelineContextValue {
  state: PipelineState;
  runId: number | null;
  currentStep: PipelineStep | null;
  activeStage: PipelineStage | null;
  canGoNext: boolean;
  completedCount: number;
  totalSteps: number;
  isHydrating: boolean;
  error: string | null;
  startPipeline: () => Promise<void>;
  executeStep: (stepId: number, payload?: Record<string, unknown>) => Promise<void>;
  persistHilState: (payload: Record<string, unknown>) => Promise<void>;
  goNext: () => void;
  resetPipeline: () => Promise<void>;
  refreshRun: () => Promise<void>;
  getStep: (stepId: number) => PipelineStep | undefined;
  getStageForStep: (stepId: number) => StageGroup | undefined;
}

const PipelineContext = createContext<PipelineContextValue | null>(null);

function normalizeRunState(serverState: PipelineRunState): PipelineState {
  return {
    currentStepId: serverState.currentStepId,
    steps: serverState.steps,
    pipelineData: serverState.pipelineData || {},
    isRunning: serverState.isRunning,
    startedAt: serverState.startedAt,
    completedAt: serverState.completedAt,
  };
}

export function PipelineProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PipelineState>(INITIAL_STATE);
  const [runId, setRunId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  const applyServerState = useCallback((serverState: PipelineRunState) => {
    setRunId(serverState.runId);
    setState(normalizeRunState(serverState));
    setError(serverState.error || null);
  }, []);

  const refreshRun = useCallback(async () => {
    if (!runId) {
      const latest = await getLatestPipelineRun();
      if (latest) {
        applyServerState(latest);
      }
      return;
    }

    const next = await getPipelineRun(runId);
    applyServerState(next);
  }, [applyServerState, runId]);

  useEffect(() => {
    let isCancelled = false;

    async function hydrate() {
      try {
        const latest = await getLatestPipelineRun();
        if (!isCancelled && latest) {
          applyServerState(latest);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Failed to load pipeline");
        }
      } finally {
        if (!isCancelled) {
          setIsHydrating(false);
        }
      }
    }

    hydrate();
    return () => {
      isCancelled = true;
    };
  }, [applyServerState]);

  const currentStep = useMemo(
    () => state.steps.find((step) => step.id === state.currentStepId) ?? null,
    [state.currentStepId, state.steps]
  );
  const activeStage = currentStep?.stage ?? null;
  const completedCount = state.steps.filter((step) => step.status === "completed").length;
  const canGoNext = Boolean(currentStep?.status === "completed" && !state.isRunning);

  const startPipeline = useCallback(async () => {
    try {
      setError(null);
      const next = await createPipelineRun();
      applyServerState(next);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start pipeline";
      setError(message);
    }
  }, [applyServerState]);

  const executeStep = useCallback(
    async (stepId: number, payload: Record<string, unknown> = {}) => {
      const step = state.steps.find((item) => item.id === stepId);
      if (!runId || !step) {
        throw new Error("Pipeline run is not ready");
      }

      setError(null);
      setState((current) => ({
        ...current,
        isRunning: true,
        steps: current.steps.map((item) =>
          item.id === stepId ? { ...item, status: "running" } : item
        ),
      }));

      try {
        const next = await executePipelineStep(runId, step.key, payload);
        applyServerState(next);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Step execution failed";
        setError(message);
        setState((current) => ({
          ...current,
          isRunning: false,
          steps: current.steps.map((item) =>
            item.id === stepId
              ? {
                  ...item,
                  status: "error",
                  result: {
                    success: false,
                    message,
                    timestamp: new Date().toISOString(),
                  },
                }
              : item
          ),
        }));
      }
    },
    [applyServerState, runId, state.steps]
  );

  const persistHilState = useCallback(
    async (payload: Record<string, unknown>) => {
      await executeStep(8, payload);
    },
    [executeStep]
  );

  const goNext = useCallback(() => {
    setState((current) => {
      const nextStepId = Math.min(current.currentStepId + 1, INITIAL_STEPS.length + 1);
      return {
        ...current,
        currentStepId: nextStepId,
      };
    });
  }, []);

  const resetPipeline = useCallback(async () => {
    setRunId(null);
    setError(null);
    setState(INITIAL_STATE);
    const latest = await getLatestPipelineRun();
    if (latest) {
      applyServerState(latest);
    }
  }, [applyServerState]);

  const getStep = useCallback((stepId: number) => state.steps.find((step) => step.id === stepId), [state.steps]);
  const getStageForStep = useCallback(
    (stepId: number) => STAGE_GROUPS.find((group) => group.steps.includes(stepId)),
    []
  );

  const value: PipelineContextValue = {
    state,
    runId,
    currentStep,
    activeStage,
    canGoNext,
    completedCount,
    totalSteps: INITIAL_STEPS.length,
    isHydrating,
    error,
    startPipeline,
    executeStep,
    persistHilState,
    goNext,
    resetPipeline,
    refreshRun,
    getStep,
    getStageForStep,
  };

  return <PipelineContext.Provider value={value}>{children}</PipelineContext.Provider>;
}

export function usePipelineCtx(): PipelineContextValue {
  const context = useContext(PipelineContext);
  if (!context) {
    throw new Error("usePipelineCtx must be used within <PipelineProvider>");
  }
  return context;
}
