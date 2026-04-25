import React from "react";
import { useWindows } from "../../context/WindowContext";
import { getApp } from "../../store/appRegistry";
import AppIcon from "../icons/AppIcon";
import "./LeftSidebar.css";

const LEFT_APPS = [
  { id: "word", label: "Word" },
  { id: "powerpoint", label: "PowerPoint" },
  { id: "excel", label: "Excel" },
  { id: "meeting", label: "Teams" },
  { id: "rfp-dashboard", label: "RFP Discovery" },
];

export default function LeftSidebar() {
  const { openWindow } = useWindows();

  return (
    <aside className="left-sidebar" aria-label="Desktop Applications">
      <div className="left-sidebar__stack">
        {LEFT_APPS.map((appRef) => {
          const app = getApp(appRef.id);
          if (!app) return null;

          return (
            <button
              key={app.id}
              type="button"
              className="left-sidebar__icon-btn"
              onClick={() => openWindow(app.id, app.label, { size: app.defaultSize })}
              title={app.description}
              aria-label={appRef.label}
            >
              <span className="left-sidebar__glyph">
                <AppIcon appId={app.id} letter={app.icon} />
              </span>
              <span className="left-sidebar__label">{appRef.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

