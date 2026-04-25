/**
 * App.jsx
 * ───────
 * Application root.  Wraps the entire UI in the WindowProvider
 * so every component can access the window manager state.
 */

import React from "react";
import { WindowProvider } from "./context/WindowContext";
import Desktop            from "./components/desktop/Desktop";
import PipelineApp       from "./features/pipeline/App";
import "./App.css";

export default function App() {
  const isStandalonePipeline = typeof window !== "undefined" && window.location.pathname.startsWith("/pipeline");

  if (isStandalonePipeline) {
    return <PipelineApp standalone />;
  }

  return (
    <WindowProvider>
      <Desktop />
    </WindowProvider>
  );
}
