import React from "react";
import "./OfficeApp.css";

const APP_META = {
  word: {
    ribbon: "#1d63d8",
    line: "#2f79f1",
    title: "Draft Proposal Narrative",
    subtitle: "Auto-saved 2 minutes ago",
    cta: "Share",
  },
  excel: {
    ribbon: "#1b874c",
    line: "#2ca35f",
    title: "RFP Cost Model FY-27",
    subtitle: "Filtered view: pricing assumptions",
    cta: "Refresh",
  },
  powerpoint: {
    ribbon: "#ce551f",
    line: "#ea6e2b",
    title: "Capture Review Deck",
    subtitle: "Slide 9 of 21",
    cta: "Present",
  },
  outlook: {
    ribbon: "#1d78e6",
    line: "#2a8fff",
    title: "Inbox - Capture Team",
    subtitle: "13 unread messages",
    cta: "Compose",
  },
  onenote: {
    ribbon: "#7f45cf",
    line: "#9d62e3",
    title: "Meeting Notes - Teams Sync",
    subtitle: "Section: Delivery Risks",
    cta: "Add Page",
  },
};

function MockRows({ appId }) {
  if (appId === "excel") {
    return (
      <div className="office-app__table">
        <div className="office-app__row office-app__row--head">
          <span>Line Item</span>
          <span>Owner</span>
          <span>Value</span>
        </div>
        <div className="office-app__row">
          <span>Platform Integration</span>
          <span>Devon</span>
          <span>$1.6M</span>
        </div>
        <div className="office-app__row">
          <span>Cloud Migration</span>
          <span>Ian</span>
          <span>$1.1M</span>
        </div>
        <div className="office-app__row">
          <span>Security Services</span>
          <span>Olivia</span>
          <span>$0.8M</span>
        </div>
      </div>
    );
  }

  if (appId === "outlook") {
    return (
      <div className="office-app__table">
        <div className="office-app__row office-app__row--head">
          <span>From</span>
          <span>Subject</span>
          <span>Time</span>
        </div>
        <div className="office-app__row">
          <span>Legal</span>
          <span>Need updated teaming agreement</span>
          <span>11:24</span>
        </div>
        <div className="office-app__row">
          <span>Finance</span>
          <span>Pricing guardrails approved</span>
          <span>10:58</span>
        </div>
        <div className="office-app__row">
          <span>Ops</span>
          <span>Delivery risk matrix attached</span>
          <span>09:12</span>
        </div>
      </div>
    );
  }

  return (
    <div className="office-app__doc">
      <p>Executive Summary</p>
      <p>
        This workspace is a static frontend mock for the {APP_META[appId]?.title}.
        It is intentionally backend-free and designed to behave like a desktop app window.
      </p>
      <p>
        Teams remains the interactive meeting experience, while this app provides visual continuity for
        a complete office-style desktop.
      </p>
    </div>
  );
}

export default function OfficeApp({ appId, appLabel }) {
  const meta = APP_META[appId] ?? APP_META.word;

  return (
    <div className="office-app" style={{ "--office-ribbon": meta.ribbon, "--office-line": meta.line }}>
      <header className="office-app__header">
        <div>
          <h2>{appLabel}</h2>
          <p>{meta.title}</p>
        </div>
        <button type="button" className="office-app__cta">{meta.cta}</button>
      </header>

      <div className="office-app__tabs">
        <span>File</span>
        <span>Home</span>
        <span>Insert</span>
        <span>Review</span>
        <span>View</span>
      </div>

      <div className="office-app__canvas">
        <div className="office-app__sheet">
          <div className="office-app__sheet-title">{meta.subtitle}</div>
          <MockRows appId={appId} />
        </div>
      </div>
    </div>
  );
}

