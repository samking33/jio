/**
 * AppLauncher
 * -----------
 * Bottom dock. Renders one button per app in the registry.
 */

import React, { useMemo, useState } from "react";
import { useWindows } from "../../context/WindowContext";
import { APP_REGISTRY } from "../../store/appRegistry";
import AppIcon from "../icons/AppIcon";
import "./AppLauncher.css";

export default function AppLauncher() {
  const { openWindow, windows } = useWindows();
  const [hoveredId, setHoveredId] = useState(null);

  const dockApps = useMemo(
    () => APP_REGISTRY.filter((app) => app.showInDock !== false),
    []
  );

  const winByApp = Object.fromEntries(windows.map((w) => [w.appId, w]));

  return (
    <nav className="dock" aria-label="Application dock">
      <div className="dock__track">
        {dockApps.map((app) => {
          const win = winByApp[app.id];
          const isOpen = Boolean(win);
          const isActive = isOpen && !win.isMinimized;
          const isHovered = hoveredId === app.id;

          return (
            <div
              key={app.id}
              className="dock__slot"
              onMouseEnter={() => setHoveredId(app.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <span className={`dock__tooltip ${isHovered ? "dock__tooltip--visible" : ""}`}>
                {app.label}
              </span>

              <button
                className={`dock__item ${isActive ? "dock__item--active" : ""} ${isHovered ? "dock__item--hovered" : ""}`}
                onClick={() => openWindow(app.id, app.label, { size: app.defaultSize })}
                title={app.description}
                aria-label={app.label}
                type="button"
              >
                <span className="dock__icon-wrap">
                  <AppIcon appId={app.id} letter={app.icon} />
                  <span className="dock__gloss" aria-hidden="true" />
                </span>
              </button>

              {isOpen && (
                <span
                  className={`dock__dot ${isActive ? "dock__dot--active" : ""}`}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

