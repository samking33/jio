import React from "react";

const AVATAR_COLORS = {
  olivia: "#6e79ff",
  devon: "#4fb0d8",
  ian: "#5fbc8f",
  you: "#8d7ed7",
};

function MicOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3a3 3 0 0 1 3 3v4a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3z" fill="currentColor" />
      <path d="M18 10a6 6 0 0 1-10.24 4.24l1.43-1.43A4 4 0 0 0 16 10h2z" fill="currentColor" />
      <path d="M11 18.93V21h2v-2.07a7.95 7.95 0 0 0 3.64-1.54l1.77 1.77 1.41-1.41L5.59 3.52 4.18 4.93l3.39 3.39V10a4 4 0 0 0 5.95 3.49l1.51 1.51A5.99 5.99 0 0 1 6 10H4a8 8 0 0 0 7 7.93z" fill="currentColor" />
    </svg>
  );
}

function MicOnIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3a3 3 0 0 1 3 3v4a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3z" fill="currentColor" />
      <path d="M19 10a7 7 0 0 1-6 6.92V20h3v2H8v-2h3v-3.08A7 7 0 0 1 5 10h2a5 5 0 0 0 10 0h2z" fill="currentColor" />
    </svg>
  );
}

export default function ParticipantTile({ participant }) {
  const avatarColor = AVATAR_COLORS[participant.id] ?? "#6b7cae";

  return (
    <article
      className={[
        "participant-tile",
        participant.isYou ? "participant-tile--you" : "",
        participant.isActiveSpeaker ? "participant-tile--active" : "",
      ].join(" ")}
      title={participant.name}
      role="listitem"
    >
      <div className="participant-tile__avatar" style={{ backgroundColor: avatarColor }}>
        {participant.initial}
      </div>

      <div className="participant-tile__footer">
        <span className="participant-tile__name">{participant.name}</span>
        <span
          className={`participant-tile__mic ${participant.muted ? "participant-tile__mic--muted" : ""}`}
          aria-label={participant.muted ? "Muted" : "Unmuted"}
        >
          {participant.muted ? <MicOffIcon /> : <MicOnIcon />}
        </span>
      </div>
    </article>
  );
}
