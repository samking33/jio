import React from "react";
import { rfpUseBackendStatus } from "../hooks/rfpUseBackendStatus";
import "./RfpHeader.css";

export default function RfpHeader() {
  const status = rfpUseBackendStatus();

  const statusLabel = {
    online:   "Connected",
    offline:  "Disconnected",
    checking: "Checking…",
  }[status];

  return (
    <header className="rfp-hdr">
      <div className="rfp-hdr__inner">
        {/* Brand */}
        <div className="rfp-hdr__brand">
          <div className="rfp-hdr__brand-icon" aria-hidden="true">◈</div>
          <div>
            <div className="rfp-hdr__brand-name">RFP Discovery</div>
            <div className="rfp-hdr__brand-sub">Pipeline · v2.4</div>
          </div>
        </div>

        {/* Right: status */}
        <div className="rfp-hdr__right">
          <div className={`rfp-hdr__status rfp-hdr__status--${status}`}>
            <span className="rfp-hdr__status-dot" />
            <span className="rfp-hdr__status-label">{statusLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
