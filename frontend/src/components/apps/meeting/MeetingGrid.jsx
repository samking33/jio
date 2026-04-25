import React from "react";
import ParticipantTile from "./ParticipantTile";

export default function MeetingGrid({ participants }) {
  return (
    <div className="teams-grid" role="list" aria-label="Meeting participants">
      {participants.map((participant) => (
        <ParticipantTile key={participant.id} participant={participant} />
      ))}
    </div>
  );
}
