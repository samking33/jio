import React from "react";
import "./Dashboard.css";

function TinyChart({ points, color }) {
  return (
    <svg viewBox="0 0 100 36" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const CARDS = [
  {
    id: "kpi1",
    title: "Opportunity Pipeline",
    value: "$48.2M",
    change: "+6.4%",
    points: "2,30 18,27 36,24 52,18 72,14 98,10",
    color: "#6f7dff",
  },
  {
    id: "kpi2",
    title: "Win Probability",
    value: "68%",
    change: "+2.1%",
    points: "2,28 20,24 38,22 56,18 74,14 98,12",
    color: "#41c59b",
  },
  {
    id: "kpi3",
    title: "Qualification Score",
    value: "84",
    change: "+4 pts",
    points: "2,31 18,29 38,25 54,20 76,16 98,12",
    color: "#f6ae57",
  },
  {
    id: "kpi4",
    title: "Sector Trend",
    value: "Upward",
    change: "Gov +12%",
    points: "2,32 20,27 36,23 52,20 74,14 98,8",
    color: "#7ea8ff",
  },
  {
    id: "kpi5",
    title: "Forecast Confidence",
    value: "81%",
    change: "Stable",
    points: "2,26 18,22 36,21 54,18 72,15 98,13",
    color: "#4dd7b6",
  },
  {
    id: "kpi6",
    title: "Open Decisions",
    value: "14",
    change: "3 urgent",
    points: "2,22 18,19 34,23 52,20 72,17 98,14",
    color: "#b990ff",
  },
];

export default function Dashboard() {
  return (
    <main className="dashboard" aria-label="Opportunity Intelligence">
      <header className="dashboard__head">
        <h2>Opportunity Intelligence</h2>
        <p>Analytics and command view for opportunities, qualification, and trend monitoring</p>
      </header>

      <section className="dashboard__grid">
        {CARDS.map((card) => (
          <article key={card.id} className="dashboard-card">
            <div className="dashboard-card__top">
              <span>{card.title}</span>
              <em>{card.change}</em>
            </div>
            <strong>{card.value}</strong>
            <TinyChart points={card.points} color={card.color} />
          </article>
        ))}
      </section>
    </main>
  );
}

