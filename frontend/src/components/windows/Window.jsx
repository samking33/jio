/**
 * Window
 * ──────
 * Renders a single OS-style window with:
 *   - Title bar (drag handle + traffic-light buttons)
 *   - Content area (children)
 *   - Maximized state (fills desktop canvas)
 *   - Focus highlight via activeWindowId
 */

import React, { useCallback } from "react";
import { useWindows }  from "../../context/WindowContext";
import { useDrag }     from "../../hooks/useDrag";
import { getApp }      from "../../store/appRegistry";
import "./Window.css";

export default function Window({ window: win, children }) {
  const {
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    moveWindow,
    activeWindowId,
  } = useWindows();

  const isActive = win.id === activeWindowId;
  const app      = getApp(win.appId);

  /* Drag handler — only active when not maximized */
  const handleMove = useCallback(
    (pos) => moveWindow(win.id, pos),
    [win.id, moveWindow]
  );
  const { onMouseDown: onTitleMouseDown } = useDrag(win.position, handleMove);

  /* Position / size style */
  const style = win.isMaximized
    ? { top: 0, left: 0, width: "100%", height: "100%", zIndex: win.zIndex }
    : {
        top:    win.position.y,
        left:   win.position.x,
        width:  win.size.width,
        height: win.size.height,
        zIndex: win.zIndex,
      };

  return (
    <div
      className={`os-window ${isActive ? "os-window--active" : ""} ${win.isMaximized ? "os-window--maximized" : ""}`}
      style={style}
      onMouseDown={() => focusWindow(win.id)}
    >
      {/* ── Title bar ────────────────────────────────────────────── */}
      <div
        className="os-window__titlebar"
        onMouseDown={win.isMaximized ? undefined : onTitleMouseDown}
      >
        <span className="os-window__icon">{app?.icon ?? "🗂"}</span>
        <span className="os-window__title">{win.title}</span>

        <div className="os-window__controls">
          {/* Minimise */}
          <button
            className="os-window__btn os-window__btn--min"
            onClick={() => minimizeWindow(win.id)}
            title="Minimise"
          >─</button>

          {/* Maximise / restore */}
          <button
            className="os-window__btn os-window__btn--max"
            onClick={() => win.isMaximized ? restoreWindow(win.id) : maximizeWindow(win.id)}
            title={win.isMaximized ? "Restore" : "Maximise"}
          >{win.isMaximized ? "⊡" : "□"}</button>

          {/* Close */}
          <button
            className="os-window__btn os-window__btn--close"
            onClick={() => closeWindow(win.id)}
            title="Close"
          >✕</button>
        </div>
      </div>

      {/* ── Content area ─────────────────────────────────────────── */}
      <div className="os-window__body">
        {children}
      </div>
    </div>
  );
}
