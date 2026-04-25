import React, { useId } from "react";

function OfficeGlyph({ bgA, bgB, face, letter }) {
  const gradId = useId();

  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={bgA} />
          <stop offset="100%" stopColor={bgB} />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="11" fill={`url(#${gradId})`} />
      <rect x="8" y="8" width="32" height="32" rx="8" fill={face} fillOpacity="0.26" />
      <text
        x="24"
        y="31"
        textAnchor="middle"
        fontSize="20"
        fontWeight="700"
        fontFamily="'Segoe UI', sans-serif"
        fill="white"
      >
        {letter}
      </text>
    </svg>
  );
}

function PipelineIcon() {
  const teeth = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="pipe-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="11" fill="url(#pipe-bg)" />
      <circle cx="24" cy="24" r="7" stroke="white" strokeOpacity="0.9" strokeWidth="2.4" fill="none" />
      <circle cx="24" cy="24" r="2.2" fill="white" fillOpacity="0.9" />
      {teeth.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 24 + Math.cos(rad) * 9;
        const y1 = 24 + Math.sin(rad) * 9;
        const x2 = 24 + Math.cos(rad) * 12;
        const y2 = 24 + Math.sin(rad) * 12;
        return (
          <line
            key={deg}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="white"
            strokeOpacity="0.84"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function SourcesIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="src-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="11" fill="url(#src-bg)" />
      <path
        d="M18 22 L14 22 Q10 22 10 26 Q10 30 14 30 L18 30"
        stroke="white"
        strokeOpacity="0.9"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M30 22 L34 22 Q38 22 38 26 Q38 30 34 30 L30 30"
        stroke="white"
        strokeOpacity="0.9"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <line x1="17" y1="26" x2="31" y2="26" stroke="white" strokeOpacity="0.9" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function RfpIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="rfp-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="11" fill="url(#rfp-bg)" />
      <rect x="10" y="10" width="28" height="28" rx="6" fill="white" fillOpacity="0.18" />
      <rect x="14" y="16" width="18" height="2.5" rx="1.25" fill="white" fillOpacity="0.9" />
      <rect x="14" y="21" width="20" height="2.5" rx="1.25" fill="white" fillOpacity="0.75" />
      <rect x="14" y="26" width="16" height="2.5" rx="1.25" fill="white" fillOpacity="0.75" />
      <rect x="14" y="31" width="14" height="2.5" rx="1.25" fill="white" fillOpacity="0.6" />
    </svg>
  );
}

const ICONS = {
  word: <OfficeGlyph bgA="#2b79f7" bgB="#1958c9" face="#0f3f9e" letter="W" />,
  excel: <OfficeGlyph bgA="#1fa35e" bgB="#177b48" face="#0e5f38" letter="X" />,
  powerpoint: <OfficeGlyph bgA="#f16f29" bgB="#cc4f17" face="#9a3b12" letter="P" />,
  meeting: <OfficeGlyph bgA="#7864ef" bgB="#5c49cc" face="#433594" letter="T" />,
  outlook: <OfficeGlyph bgA="#3194ff" bgB="#1e6cd7" face="#1253ab" letter="O" />,
  onenote: <OfficeGlyph bgA="#9b56da" bgB="#7f39c4" face="#5f2e95" letter="N" />,
  "rfp-dashboard": <RfpIcon />,
  pipeline: <PipelineIcon />,
  sources: <SourcesIcon />,
};

function FallbackIcon({ letter }) {
  return <OfficeGlyph bgA="#475569" bgB="#334155" face="#1e293b" letter={letter} />;
}

export default function AppIcon({ appId, letter = "A" }) {
  return ICONS[appId] ?? <FallbackIcon letter={letter} />;
}
