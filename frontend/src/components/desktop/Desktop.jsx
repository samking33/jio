/**
 * Desktop
 * ───────
 * The full-screen desktop surface.  Renders:
 *   - Background / wallpaper layer
 *   - All open (non-minimised) windows via <WindowManager>
 *   - The app launcher dock at the bottom
 *   - A top status bar
 */

import React from "react";
import WindowManager from "../windows/WindowManager";
import AppLauncher   from "../launcher/AppLauncher";
import StatusBar     from "./StatusBar";
import LeftSidebar from "./LeftSidebar";
import Dashboard from "./Dashboard";
import RightSidebar from "./RightSidebar";
import "./Desktop.css";

export default function Desktop() {
  return (
    <div className="desktop">
      {/* Ambient background grid / scanline texture */}
      <div className="desktop__bg" aria-hidden="true" />

      {/* Top status bar */}
      <StatusBar />

      {/* Window layer — all draggable windows live here */}
      <div className="desktop__canvas">
        <div className="desktop-layout">
          <LeftSidebar />
          <Dashboard />
          <RightSidebar />
        </div>
        <WindowManager />
      </div>

      {/* Bottom dock */}
      <AppLauncher />
    </div>
  );
}
