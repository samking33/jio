import React, { useMemo } from "react";
import { useWindows } from "../../context/WindowContext";
import { APP_REGISTRY } from "../../store/appRegistry";
import AppIcon from "../icons/AppIcon";
import "./DesktopIcons.css";

export default function DesktopIcons() {
  const { openWindow } = useWindows();

  const icons = useMemo(
    () => APP_REGISTRY.filter((app) => app.showOnDesktop),
    []
  );

  return (
    <div className="desktop-icons" aria-label="Desktop icons">
      {icons.map((app) => (
        <button
          key={app.id}
          type="button"
          className="desktop-icons__item"
          onClick={() => openWindow(app.id, app.label, { size: app.defaultSize })}
          title={app.description}
          aria-label={app.label}
        >
          <span className="desktop-icons__glyph">
            <AppIcon appId={app.id} letter={app.icon} />
          </span>
          <span className="desktop-icons__label">{app.label}</span>
        </button>
      ))}
    </div>
  );
}

