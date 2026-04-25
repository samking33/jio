/**
 * RFPDashboard.jsx — Figma redesign root
 * ──────────────────────────────────────
 * Replaces the old single-page layout with a Figma-aligned multi-page
 * mini-app (Overview → Discovery → Analysis → Decision).
 *
 * 🔒 SCOPE: Only files inside /rfp/ are modified.
 *    - Virtual desktop, App.jsx, hooks/, api/ are NOT touched.
 *    - useRFPs hook is imported as-is, no modification.
 *
 * All CSS classes are prefixed with "rfpd__" or "rfp-" to prevent
 * any style leakage into the virtual desktop shell.
 */

import React, { useState } from "react";
import { useRFPs } from "../../../hooks/useRFPs";

import RfpHeader       from "./components/RfpHeader";
import RfpPipelineNav  from "./components/RfpPipelineNav";
import RfpOverviewPage from "./components/pages/RfpOverviewPage";
import RfpDiscoveryPage from "./components/pages/RfpDiscoveryPage";
import RfpAnalysisPage from "./components/pages/RfpAnalysisPage";
import RfpDecisionPage from "./components/pages/RfpDecisionPage";

import "./rfp-tokens.css";
import "./RFPDashboard.css";

export default function RFPDashboard() {
  const [activePage, setActivePage] = useState("overview");

  const navigate = (page) => setActivePage(page);

  const renderPage = () => {
    switch (activePage) {
      case "overview":   return <RfpOverviewPage  navigate={navigate} />;
      case "discovery":  return <RfpDiscoveryPage navigate={navigate} />;
      case "analysis":   return <RfpAnalysisPage  navigate={navigate} />;
      case "decision":   return <RfpDecisionPage  navigate={navigate} />;
      default:           return <RfpOverviewPage  navigate={navigate} />;
    }
  };

  return (
    <div className="rfpd">
      {/* Fixed top bar with brand + backend status */}
      <RfpHeader />

      {/* Pipeline stage stepper — shown on non-overview pages */}
      {activePage !== "overview" && (
        <RfpPipelineNav activePage={activePage} navigate={navigate} />
      )}

      {/* Page content */}
      <main className="rfpd__main">
        {renderPage()}
      </main>
    </div>
  );
}
