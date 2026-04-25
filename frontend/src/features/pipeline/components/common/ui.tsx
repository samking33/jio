/**
 * ui.tsx — Shared design-system primitives
 * All styling uses exact tokens from T (tokens.ts) to preserve the dashboard look.
 */

import React, { type CSSProperties, type ReactNode } from "react";
import { T } from "../../utils/tokens";
import {
  AreaChart, Area, ResponsiveContainer,
} from "recharts";

// ─── PANEL ───────────────────────────────────────────────────────────────────
interface PanelProps {
  children: ReactNode;
  style?: CSSProperties;
}
export function Panel({ children, style }: PanelProps) {
  return (
    <div style={{
      background: T.surface, borderRadius: 8,
      border: `1px solid ${T.border}`,
      boxShadow: T.shadow, overflow: "hidden", ...style,
    }}>
      {children}
    </div>
  );
}

// ─── PANEL HEADER ────────────────────────────────────────────────────────────
interface PanelHdProps {
  title: ReactNode;
  icon?: ReactNode;
  right?: ReactNode;
}
export function PanelHd({ title, icon, right }: PanelHdProps) {
  return (
    <div style={{
      padding: "10px 14px", borderBottom: `1px solid ${T.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.8rem", fontWeight: 700, color: T.text }}>
        {icon !== undefined && (
          <div style={{
            width: 24, height: 24, borderRadius: 6, display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "0.72rem", background: "#EEF4FF", color: T.primary,
          }}>
            {icon}
          </div>
        )}
        {title}
      </div>
      {right}
    </div>
  );
}

// ─── BADGE ───────────────────────────────────────────────────────────────────
type BadgeVariant = "success" | "warning" | "danger" | "primary" | "teal" | "neutral";
interface BadgeProps { children: ReactNode; variant?: BadgeVariant; }
export function Badge({ children, variant = "neutral" }: BadgeProps) {
  const styles: Record<BadgeVariant, CSSProperties> = {
    success: { background: T.successBg, color: T.success },
    warning: { background: T.warningBg, color: T.warning },
    danger:  { background: T.dangerBg,  color: T.danger  },
    primary: { background: "#EEF4FF", color: T.primary },
    teal:    { background: "#E7F6F3", color: T.teal },
    neutral: { background: "#F1F5F9", color: T.textMd },
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 6,
      fontSize: "0.62rem", fontWeight: 600, letterSpacing: ".3px",
      ...styles[variant],
    }}>
      {children}
    </span>
  );
}

// ─── BUTTON ──────────────────────────────────────────────────────────────────
type BtnVariant = "primary" | "secondary" | "danger" | "success";
type BtnSize = "xs" | "sm" | "md";
interface BtnProps {
  children: ReactNode;
  variant?: BtnVariant;
  size?: BtnSize;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
  type?: "button" | "submit";
}
export function Btn({ children, variant = "primary", size = "sm", onClick, disabled, style, type = "button" }: BtnProps) {
  const padding = size === "xs" ? "3px 8px" : size === "md" ? "9px 20px" : "6px 14px";
  const fontSize = size === "xs" ? "0.62rem" : size === "md" ? "0.78rem" : "0.72rem";
  const base: CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding, fontSize, fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    border: "1.5px solid transparent",
    transition: "all .2s", letterSpacing: ".2px",
    borderRadius: 6, fontFamily: "Inter, sans-serif",
  };
  const variants: Record<BtnVariant, CSSProperties> = {
    primary:   { background: T.primary,  color: "#fff",    borderColor: T.primary   },
    secondary: { background: "transparent", color: T.primary, borderColor: T.border },
    danger:    { background: "transparent", color: T.danger,  borderColor: T.dangerBg },
    success:   { background: T.success,  color: "#fff",    borderColor: T.success   },
  };
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
interface ProgressBarProps { value: number; color: string; height?: number; }
export function ProgressBar({ value, color, height = 6 }: ProgressBarProps) {
  return (
    <div style={{ height, background: "#EEF2FF", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ height: "100%", borderRadius: 99, background: color, width: `${Math.min(value, 100)}%`, transition: "width .7s" }} />
    </div>
  );
}

// ─── MINI SPARKLINE ───────────────────────────────────────────────────────────
interface MiniSparkProps { data: number[]; color: string; }
export function MiniSpark({ data, color }: MiniSparkProps) {
  const mapped = data.map((v, i) => ({ v, i }));
  const gradId = `sg-${color.replace("#", "")}`;
  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={mapped} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#${gradId})`} isAnimationActive={false} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── DONUT SCORE ─────────────────────────────────────────────────────────────
export function DonutScore({ value }: { value: number }) {
  const color = value >= 70 ? T.success : value >= 50 ? T.warning : T.danger;
  return (
    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
      <svg width={48} height={48} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={24} cy={24} r={19} stroke="#e5e7eb" strokeWidth={5} fill="none" />
        <circle cx={24} cy={24} r={19} stroke={color} strokeWidth={5} fill="none" strokeDasharray={`${value * 1.194} 119.4`} strokeLinecap="round" />
      </svg>
      <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, color: T.text }}>
        {value}
      </span>
    </div>
  );
}

// ─── SPINNER ─────────────────────────────────────────────────────────────────
export function Spinner({ size = 16, color = T.primary }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity={0.2} strokeWidth="3" fill="none" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ─── SECTION DIVIDER ─────────────────────────────────────────────────────────
export function Divider({ margin = "10px 0" }: { margin?: string }) {
  return <div style={{ height: 1, background: T.border, margin }} />;
}
