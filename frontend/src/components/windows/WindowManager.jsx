/**
 * WindowManager
 * ─────────────
 * Iterates over the windows array from context and renders a <Window>
 * component for each one that is open and not minimized.
 *
 * Window components are absolutely positioned inside the desktop canvas.
 */

import React from "react";
import { useWindows } from "../../context/WindowContext";
import Window          from "./Window";
import AppShell        from "./AppShell";

export default function WindowManager() {
  const { windows } = useWindows();

  // Only render visible, non-minimized windows
  const visible = windows.filter(w => w.isOpen && !w.isMinimized);

  return (
    <>
      {visible.map(win => (
        <Window key={win.id} window={win}>
          {/* AppShell resolves the appId → actual app component (Step 3) */}
          <AppShell appId={win.appId} />
        </Window>
      ))}
    </>
  );
}
