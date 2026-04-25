import React from "react";
import "./RfpPipelineNav.css";

const STAGES = [
  { id: "discovery", label: "Discovery", step: 1 },
  { id: "analysis",  label: "Analysis",  step: 2 },
  { id: "decision",  label: "Decision",  step: 3 },
];

function getStageIndex(page) {
  return STAGES.findIndex(s => s.id === page);
}

export default function RfpPipelineNav({ activePage, navigate }) {
  const currentIdx = getStageIndex(activePage);

  return (
    <div className="rfp-pnav">
      <div className="rfp-pnav__inner">
        <div className="rfp-pnav__header">
          <div>
            <h1 className="rfp-pnav__title">RFP Discovery Pipeline</h1>
            <p className="rfp-pnav__sub">
              Stage {currentIdx + 1} of {STAGES.length}
            </p>
          </div>
        </div>

        <div className="rfp-pnav__stages">
          {STAGES.map((stage, idx) => {
            const isActive    = currentIdx === idx;
            const isCompleted = currentIdx > idx;

            return (
              <React.Fragment key={stage.id}>
                <div className="rfp-pnav__stage-wrap">
                  <button
                    className={`rfp-pnav__circle ${isCompleted ? "completed" : isActive ? "active" : ""}`}
                    onClick={() => navigate(stage.id)}
                    title={`Go to ${stage.label}`}
                  >
                    {isCompleted ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7l3.5 3.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      stage.step
                    )}
                  </button>
                  <span className={`rfp-pnav__label ${isActive ? "active" : ""}`}>
                    {stage.label}
                  </span>
                </div>

                {idx < STAGES.length - 1 && (
                  <div className="rfp-pnav__connector">
                    <div
                      className="rfp-pnav__connector-fill"
                      style={{ transform: `scaleX(${isCompleted ? 1 : 0})` }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
