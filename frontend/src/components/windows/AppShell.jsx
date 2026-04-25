/**
 * AppShell
 * --------
 * Routes appId to app component.
 */

import React from "react";
import { getApp } from "../../store/appRegistry";
import RFPDashboard from "../apps/rfp/RFPDashboard";
import TeamsApp from "../apps/meeting/TeamsApp";
import PipelineRunner from "../apps/pipeline/PipelineRunner";
import SourceManager from "../apps/sources/SourceManager";
import OfficeApp from "../apps/office/OfficeApp";
import AnalyticsWorkspace from "../apps/analytics/AnalyticsWorkspace";
import "./AppShell.css";

const APP_MAP = {
  word: OfficeApp,
  excel: OfficeApp,
  powerpoint: OfficeApp,
  "rfp-dashboard": RFPDashboard,
  meeting: TeamsApp,
  analytics: AnalyticsWorkspace,
  outlook: OfficeApp,
  onenote: OfficeApp,
  pipeline: PipelineRunner,
  sources: SourceManager,
};

export default function AppShell({ appId }) {
  const Component = APP_MAP[appId];
  const app = getApp(appId);

  if (Component) {
    if (["word", "excel", "powerpoint", "outlook", "onenote"].includes(appId)) {
      return <Component appId={appId} appLabel={app?.label ?? appId} />;
    }
    return <Component />;
  }

  return (
    <div className="app-shell-placeholder">
      <span className="app-shell-placeholder__icon">{app?.icon ?? "??"}</span>
      <h2 className="app-shell-placeholder__name">{app?.label ?? appId}</h2>
      <p className="app-shell-placeholder__hint">No component registered</p>
    </div>
  );
}
