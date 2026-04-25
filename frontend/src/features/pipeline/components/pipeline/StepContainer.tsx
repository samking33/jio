/**
 * StepContainer.tsx
 *
 * Reads currentStepId from context and renders the matching step component.
 * This is the ONLY place that decides which step is on screen.
 *
 * Flow:
 *   0         → StartScreen (pipeline not yet started)
 *   1 – 3     → Discovery steps
 *   4 – 6     → Analysis steps
 *   7 – 9     → Decision steps
 *   10        → Feedback step
 *   11+       → OverviewDashboard
 */

import React from "react";
import { usePipeline } from "../../hooks/usePipeline";

// Step components
import { Step1Crawl }    from "./steps/Step1Crawl";
import { Step2Filter }   from "./steps/Step2Filter";
import { Step3Download } from "./steps/Step3Download";
import { Step4Extract }  from "./steps/Step4Extract";
import { Step5Certs }    from "./steps/Step5Certs";
import { Step6Risk }     from "./steps/Step6Risk";
import { Step7Convert }  from "./steps/Step7Convert";
import { Step8HIL }      from "./steps/Step8HIL";
import { Step9Forward }  from "./steps/Step9Forward";
import { Step10Log }     from "./steps/Step10Log";

// Surrounding screens
import { StartScreen }        from "../dashboard/StartScreen";
import { OverviewDashboard }  from "../dashboard/OverviewDashboard";

export function StepContainer() {
  const { state, isPipelineDone } = usePipeline();
  const { currentStepId } = state;

  // Pre-start
  if (currentStepId === 0)  return <StartScreen />;
  // Post-finish
  if (isPipelineDone)       return <OverviewDashboard />;

  const stepMap: Record<number, React.ReactElement> = {
    1:  <Step1Crawl />,
    2:  <Step2Filter />,
    3:  <Step3Download />,
    4:  <Step4Extract />,
    5:  <Step5Certs />,
    6:  <Step6Risk />,
    7:  <Step7Convert />,
    8:  <Step8HIL />,
    9:  <Step9Forward />,
    10: <Step10Log />,
  };

  return stepMap[currentStepId] ?? null;
}
