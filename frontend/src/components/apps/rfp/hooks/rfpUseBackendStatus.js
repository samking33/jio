/**
 * rfpUseBackendStatus — RFP-local copy of the backend health hook.
 * Isolated here so we never modify the shared hooks/ directory.
 * Polls GET /health every 15 s and returns "online" | "offline" | "checking".
 */
import { useState, useEffect } from "react";
import api from "../../../../api/api";

const POLL_INTERVAL = 15_000;

export function rfpUseBackendStatus() {
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
