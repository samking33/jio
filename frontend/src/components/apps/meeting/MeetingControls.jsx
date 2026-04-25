import React from "react";

function MicOnIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3a3 3 0 0 1 3 3v4a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3z" fill="currentColor" />
      <path d="M19 10a7 7 0 0 1-6 6.92V20h3v2H8v-2h3v-3.08A7 7 0 0 1 5 10h2a5 5 0 0 0 10 0h2z" fill="currentColor" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3a3 3 0 0 1 3 3v4a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3z" fill="currentColor" />
      <path d="M11 18.93V21h2v-2.07a7.95 7.95 0 0 0 3.64-1.54l1.77 1.77 1.41-1.41L5.59 3.52 4.18 4.93l3.39 3.39V10a4 4 0 0 0 5.95 3.49l1.51 1.51A5.99 5.99 0 0 1 6 10H4a8 8 0 0 0 7 7.93z" fill="currentColor" />
      <path d="M18 10a6 6 0 0 1-10.24 4.24l1.43-1.43A4 4 0 0 0 16 10h2z" fill="currentColor" />
    </svg>
  );
}

function CameraOnIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 7h10a2 2 0 0 1 2 2v1.5l4-2.5v8l-4-2.5V15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" fill="currentColor" />
    </svg>
  );
}

function CameraOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 7h8.5l2 2H14a2 2 0 0 0-2 2v3.5L4.18 6.68A2 2 0 0 1 4 7z" fill="currentColor" />
      <path d="M20 16l-4-2.5v-1l4-2.5v6z" fill="currentColor" />
      <path d="M1.41 1L0 2.41l4.43 4.43A2 2 0 0 0 2 9v6a2 2 0 0 0 2 2h10a2 2 0 0 0 1.16-.37L21.59 23 23 21.59z" fill="currentColor" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3l4 4h-3v5h-2V7H8l4-4z" fill="currentColor" />
      <path d="M4 11h5v2H6v6h12v-6h-3v-2h5v10H4V11z" fill="currentColor" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="5" cy="12" r="2" fill="currentColor" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle cx="19" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

function CallEndIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4.5 14.2c1.8-1.5 4.2-2.2 7.5-2.2s5.7.7 7.5 2.2l-1.7 3.1c-1.2-.7-2.5-1.1-3.9-1.2l-1 2.3h-1.8l-1-2.3c-1.4.1-2.7.5-3.9 1.2l-1.7-3.1z" fill="currentColor" />
    </svg>
  );
}

function ControlButton({ label, active, danger, onClick, icon }) {
  return (
    <button
      type="button"
      className={[
        "meeting-controls__btn",
        active ? "meeting-controls__btn--active" : "",
        danger ? "meeting-controls__btn--danger" : "",
      ].join(" ")}
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      <span className="meeting-controls__icon">{icon}</span>
      <span className="meeting-controls__label">{label}</span>
    </button>
  );
}

export default function MeetingControls({
  micOn,
  cameraOn,
  screenShared,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onEndCall,
}) {
  return (
    <div className="meeting-controls" role="toolbar" aria-label="Meeting controls">
      <ControlButton
        label={micOn ? "Mute" : "Unmute"}
        active={micOn}
        onClick={onToggleMic}
        icon={micOn ? <MicOnIcon /> : <MicOffIcon />}
      />
      <ControlButton
        label={cameraOn ? "Camera On" : "Camera Off"}
        active={cameraOn}
        onClick={onToggleCamera}
        icon={cameraOn ? <CameraOnIcon /> : <CameraOffIcon />}
      />
      <ControlButton
        label={screenShared ? "Stop Share" : "Share Screen"}
        active={screenShared}
        onClick={onToggleScreenShare}
        icon={<ShareIcon />}
      />
      <ControlButton
        label="More"
        onClick={() => {}}
        icon={<MoreIcon />}
      />
      <ControlButton
        label="End Call"
        danger
        onClick={onEndCall}
        icon={<CallEndIcon />}
      />
    </div>
  );
}
