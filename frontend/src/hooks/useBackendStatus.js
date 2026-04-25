/**
 * useBackendStatus
 * ────────────────
 * Polls GET /health every 15 s and exposes a simple status string.
 * Used by the StatusBar to show a backend connectivity dot.
 *
 * Returns: "online" | "offline" | "checking"
 */

import { useState, useEffect } from "react";
import api from "../api/api";

const POLL_INTERVAL = 15_000; // ms

export function useBackendStatus() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const { error } = await api.health();
      if (!cancelled) setStatus(error ? "offline" : "online");
    };

    check();
    const id = setInterval(check, POLL_INTERVAL);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return status;
}
