import React from "react";
import { BarChart3, Database, ShieldAlert } from "lucide-react";
import { useWindows } from "../../context/WindowContext";
import { formatMoney, useLiveMetrics } from "../../hooks/useLiveMetrics";
import "./IntelligenceHub.css";

export default function IntelligenceHub() {
  const { openWindow } = useWindows();
  const { metrics, derived, loading } = useLiveMetrics();

  const launchAnalytics = () => {
    openWindow("analytics", "Analytics Command Center", {
      size: { width: 1160, height: 700 },
    });
  };

  const liveCards = [
    { label: "Pipeline Value", value: formatMoney(metrics.contract_value_total || 0), icon: BarChart3 },
    { label: "Stored RFPs", value: derived.totalRfps, icon: Database },
    { label: "High Risks", value: metrics.risks_high || 0, icon: ShieldAlert },
  ];

  return (
    <div className="intelligence-hub">
      <section className="intelligence-hub__center">
        <button type="button" className="intel-hero" onClick={launchAnalytics}>
          <div className="intel-hero__title">
            <h2>Opportunity Intelligence</h2>
            <p>{loading ? "Loading live PostgreSQL metrics" : "Analytics Command Center"}</p>
          </div>

          <div className="intel-hero__kpis">
            {liveCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label}>
                  <Icon size={18} />
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                </div>
              );
            })}
          </div>
        </button>
      </section>
    </div>
  );
}
