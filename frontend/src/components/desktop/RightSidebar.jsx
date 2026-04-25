import React from "react";
import { useWindows } from "../../context/WindowContext";
import { getApp } from "../../store/appRegistry";
import "./RightSidebar.css";

const INVITES = [
  { id: "i1", title: "BRD Review Sync", time: "09:30 AM", status: "Today" },
  { id: "i2", title: "RFP Qualification Standup", time: "11:00 AM", status: "Today" },
  { id: "i3", title: "Client Discovery Call", time: "01:15 PM", status: "Today" },
  { id: "i4", title: "Bid Strategy Review", time: "04:00 PM", status: "Today" },
  { id: "i5", title: "Leadership Townhall", time: "Tomorrow 10:00 AM", status: "Upcoming" },
];

export default function RightSidebar() {
  const { openWindow } = useWindows();
  const meetingApp = getApp("meeting");

  const onJoin = () => {
    if (!meetingApp) return;
    openWindow(meetingApp.id, meetingApp.label, { size: meetingApp.defaultSize });
  };

  return (
    <aside className="right-sidebar" aria-label="Meeting Invitations">
      <header className="right-sidebar__head">
        <h3>Meeting Invitations</h3>
        <p>Notifications & Upcoming Calls</p>
      </header>

      <div className="right-sidebar__list">
        {INVITES.map((invite) => (
          <article key={invite.id} className="meeting-invite">
            <div className="meeting-invite__top">
              <span className="meeting-invite__status">{invite.status}</span>
              <span className="meeting-invite__time">{invite.time}</span>
            </div>
            <h4>{invite.title}</h4>
            <div className="meeting-invite__actions">
              <button type="button" className="meeting-invite__btn meeting-invite__btn--join" onClick={onJoin}>
                Join
              </button>
              <button type="button" className="meeting-invite__btn">Accept</button>
              <button type="button" className="meeting-invite__btn">Decline</button>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}

