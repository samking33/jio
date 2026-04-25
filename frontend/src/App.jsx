/**
 * App.jsx
 * ───────
 * Application root.  Wraps the entire UI in the WindowProvider
 * so every component can access the window manager state.
 */

import React from "react";
import { WindowProvider } from "./context/WindowContext";
import Desktop            from "./components/desktop/Desktop";
import "./App.css";

export default function App() {
  return (
    <WindowProvider>
      <Desktop />
    </WindowProvider>
  );
}
