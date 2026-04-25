import React, { useEffect, useMemo, useState } from "react";
import { useWindows } from "../../context/WindowContext";
import "./IntelligenceHub.css";

const MEETINGS = [
  {
    id: "m1",
    title: "BRD Review Sync",
    startsInMinutes: 18,
    timeLabel: "09:30 AM",
    priority: "high",
    participants: ["OP", "DK", "IA", "You"],
    aiReady: true,
    agenda: [
      "Review updated BRD scope and assumptions",
      "Finalize technical dependencies",
      "Assign owners for change requests",
    ],
  },
  {
    id: "m2",
    title: "RFP Qualification Standup",
    startsInMinutes: 64,
    timeLabel: "10:45 AM",
    priority: "medium",
    participants: ["RM", "LC", "SP"],
    aiReady: true,
    agenda: [
      "Review qualification score delta",
      "Validate compliance blockers",
      "Approve agent-generated summary",
    ],
  },
  {
    id: "m3",
    title: "Client Discovery Call",
    startsInMinutes: 138,
    timeLabel: "12:00 PM",
    priority: "high",
    participants: ["Client", "OP", "You"],
    aiReady: false,
    agenda: [
      "Clarify delivery milestones",
      "Capture client risk appetite",
      "Confirm follow-up timeline",
    ],
  },
  {
    id: "m4",
    title: "Bid Strategy Review",
    startsInMinutes: 320,
    timeLabel: "03:05 PM",
    priority: "medium",
    participants: ["LT", "RM", "IA"],
    aiReady: true,
    agenda: [
      "Compare bid strategy scenarios",
      "Review win-probability curve",
      "Agree final go/no-go gates",
    ],
  },
  {
    id: "m5",
    title: "Leadership Townhall",
    startsInMinutes: 1410,
    timeLabel: "Tomorrow 10:00 AM",
    priority: "low",
    participants: ["Exec", "All"],
    aiReady: false,
    agenda: [
      "Weekly performance summary",
      "Pipeline health update",
      "Cross-team escalations",
    ],
  },
];

const TASKS = [
  { id: "t1", type: "Reminder", text: "Update BRD draft", detail: "Incorporate qualification findings before 2 PM." },
  { id: "t2", type: "Follow-up", text: "Send qualification summary", detail: "Share concise summary with capture team and leadership." },
  { id: "t3", type: "Approval", text: "Review approvals", detail: "3 legal approvals pending for high-value bids." },
  { id: "t4", type: "Follow-up", text: "Follow up on open bids", detail: "Two bids have no status updates in the last 48 hours." },
  { id: "t5", type: "Agent", text: "Agent-generated recommendations", detail: "Raise compliance score by prioritizing Rule 001 and Rule 004 actions." },
  { id: "t6", type: "Draft", text: "Draft responses", detail: "Generate first-pass response sections for technical approach." },
];

function formatCountdown(totalSeconds) {
  const safe = Math.max(totalSeconds, 0);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

function Sparkline({ points, color }) {
  const joined = points.map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <svg viewBox="0 0 100 40" aria-hidden="true">
      <polyline points={joined} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function IntelligenceHub() {
  const { openWindow } = useWindows();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isAnalyticsLaunching, setIsAnalyticsLaunching] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setElapsedSeconds((prev) => prev + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const meetings = useMemo(() => {
    return MEETINGS.map((meeting) => {
      const secondsRemaining = meeting.startsInMinutes * 60 - elapsedSeconds;
      return {
        ...meeting,
        countdownText: formatCountdown(secondsRemaining),
        isStartingSoon: secondsRemaining <= 1800,
      };
    });
  }, [elapsedSeconds]);

  const launchAnalytics = () => {
    setIsAnalyticsLaunching(true);
    window.setTimeout(() => {
      openWindow("analytics", "Analytics Command Center", {
        size: { width: 1160, height: 700 },
      });
      setIsAnalyticsLaunching(false);
    }, 280);
  };

  return (
    <div className="intelligence-hub">
      <section className="intelligence-hub__left">
        <article className="intel-card">
          <header className="intel-card__head">
            <div>
              <h3>Meeting Invitations</h3>
              <p>Today & This Week</p>
            </div>
            <span className="intel-card__badge">{meetings.length} scheduled</span>
          </header>

          <div className="intel-meetings">
            {meetings.map((meeting) => (
              <button
                key={meeting.id}
                type="button"
                className={`intel-meeting intel-meeting--${meeting.priority}`}
                onClick={() => setSelectedMeeting(meeting)}
              >
                <span className="intel-meeting__time">{meeting.timeLabel}</span>
                <span className="intel-meeting__title">{meeting.title}</span>
                <span className="intel-meeting__participants">
                  {meeting.participants.slice(0, 3).map((p) => (
                    <span key={p}>{p}</span>
                  ))}
                  {meeting.participants.length > 3 && <span>+{meeting.participants.length - 3}</span>}
                </span>
                <span className="intel-meeting__meta">
                  <span className="intel-meeting__countdown">Starts in {meeting.countdownText}</span>
                  {meeting.aiReady && <span className="intel-meeting__ai">AI Agent can join</span>}
                  {meeting.isStartingSoon && <span className="intel-meeting__pulse" aria-hidden="true" />}
                </span>
              </button>
            ))}
          </div>
        </article>

        <article className="intel-card">
          <header className="intel-card__head">
            <div>
              <h3>Notes / Action Queue</h3>
              <p>Autonomous follow-ups</p>
            </div>
            <span className="intel-card__badge">6 items</span>
          </header>

          <div className="intel-notes">
            {TASKS.map((task) => (
              <button key={task.id} type="button" className={`intel-note intel-note--${task.type.toLowerCase()}`} onClick={() => setSelectedTask(task)}>
                <span className="intel-note__type">{task.type}</span>
                <span className="intel-note__text">{task.text}</span>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="intelligence-hub__center">
        <button type="button" className="intel-hero" onClick={launchAnalytics}>
          <div className="intel-hero__title">
            <h2>Opportunity Intelligence</h2>
            <p>Analytics Command Center</p>
          </div>

          <div className="intel-hero__kpis">
            <div>
              <span>Pipeline</span>
              <strong>$48.2M</strong>
            </div>
            <div>
              <span>Win Probability</span>
              <strong>68%</strong>
            </div>
            <div>
              <span>Qualified</span>
              <strong>19 / 27</strong>
            </div>
          </div>

          <div className="intel-hero__charts">
            <div className="intel-chart">
              <small>Qualification Trend</small>
              <Sparkline
                color="#6f7dff"
                points={[
                  { x: 5, y: 29 },
                  { x: 22, y: 24 },
                  { x: 39, y: 19 },
                  { x: 56, y: 22 },
                  { x: 73, y: 14 },
                  { x: 95, y: 10 },
                ]}
              />
            </div>
            <div className="intel-chart">
              <small>Revenue Forecast</small>
              <Sparkline
                color="#41c59b"
                points={[
                  { x: 5, y: 32 },
                  { x: 25, y: 27 },
                  { x: 43, y: 20 },
                  { x: 62, y: 16 },
                  { x: 81, y: 14 },
                  { x: 95, y: 8 },
                ]}
              />
            </div>
          </div>
        </button>
      </section>

      <section className="intelligence-hub__right" aria-hidden="true" />

      {selectedMeeting && (
        <div className="intel-modal__backdrop" onClick={() => setSelectedMeeting(null)}>
          <div className="intel-modal" onClick={(e) => e.stopPropagation()}>
            <header className="intel-modal__head">
              <div>
                <h3>{selectedMeeting.title}</h3>
                <p>{selectedMeeting.timeLabel}</p>
              </div>
              <button type="button" onClick={() => setSelectedMeeting(null)}>Close</button>
            </header>
            <ul className="intel-modal__list">
              {selectedMeeting.agenda.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {selectedTask && (
        <div className="intel-modal__backdrop" onClick={() => setSelectedTask(null)}>
          <div className="intel-modal intel-modal--task" onClick={(e) => e.stopPropagation()}>
            <header className="intel-modal__head">
              <div>
                <h3>{selectedTask.text}</h3>
                <p>{selectedTask.type} workspace</p>
              </div>
              <button type="button" onClick={() => setSelectedTask(null)}>Close</button>
            </header>
            <div className="intel-modal__task-copy">{selectedTask.detail}</div>
            <div className="intel-modal__task-actions">
              <button type="button">Assign</button>
              <button type="button">Schedule</button>
              <button type="button">Mark Complete</button>
            </div>
          </div>
        </div>
      )}

      {isAnalyticsLaunching && <div className="intel-portal-launch" aria-hidden="true" />}
    </div>
  );
}
