import React, { useEffect, useMemo, useState } from "react";
import { useWindows } from "../../../context/WindowContext";
import MeetingGrid from "./MeetingGrid";
import MeetingControls from "./MeetingControls";
import "./TeamsApp.css";

const INITIAL_PARTICIPANTS = [
  { id: "olivia", name: "Olivia", initial: "O", muted: false, isYou: false },
  { id: "devon", name: "Devon", initial: "D", muted: true, isYou: false },
  { id: "ian", name: "Ian", initial: "I", muted: false, isYou: false },
  { id: "you", name: "You", initial: "Y", muted: false, isYou: true },
];

const SIDEBAR_ITEMS = [
  { id: "activity", label: "Activity", glyph: "A" },
  { id: "chat", label: "Chat", glyph: "C" },
  { id: "teams", label: "Teams", glyph: "T" },
  { id: "calendar", label: "Calendar", glyph: "K" },
];

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function TeamsApp() {
  const { windows, closeWindow } = useWindows();

  const [elapsedSeconds, setElapsedSeconds] = useState(751); // 12:31
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenShared, setScreenShared] = useState(false);
  const [participants, setParticipants] = useState(INITIAL_PARTICIPANTS);
  const [activeSpeakerId, setActiveSpeakerId] = useState("olivia");

  const meetingWindowId = useMemo(() => {
    const win = windows.find((item) => item.appId === "meeting");
    return win?.id ?? null;
  }, [windows]);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  useEffect(() => {
    const cycle = window.setInterval(() => {
      setActiveSpeakerId((prev) => {
        const ids = participants.filter((p) => !p.isYou).map((p) => p.id);
        const currentIndex = ids.indexOf(prev);
        if (currentIndex === -1) {
          return ids[0] ?? "you";
        }
        return ids[(currentIndex + 1) % ids.length] ?? "you";
      });
    }, 3200);

    return () => {
      window.clearInterval(cycle);
    };
  }, [participants]);

  const decoratedParticipants = useMemo(() => {
    return participants.map((participant) => {
      const isActiveSpeaker = participant.id === activeSpeakerId;
      const displayMuted = participant.isYou ? !micOn : participant.muted;
      const videoOff = participant.isYou ? !cameraOn : false;

      return {
        ...participant,
        muted: displayMuted,
        videoOff,
        isActiveSpeaker,
      };
    });
  }, [participants, activeSpeakerId, micOn, cameraOn]);

  const handleToggleMic = () => {
    setMicOn((prev) => !prev);
  };

  const handleToggleCamera = () => {
    setCameraOn((prev) => !prev);
  };

  const handleShareScreen = () => {
    setScreenShared((prev) => !prev);
  };

  const handleEndCall = () => {
    if (meetingWindowId) {
      closeWindow(meetingWindowId);
    }
  };

  return (
    <div className="teams-app">
      <aside className="teams-app__sidebar" aria-label="Teams navigation">
        <div className="teams-app__brand">T</div>
        <div className="teams-app__sidebar-items">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`teams-app__sidebar-btn ${item.id === "teams" ? "teams-app__sidebar-btn--active" : ""}`}
              title={item.label}
              aria-label={item.label}
              type="button"
            >
              {item.glyph}
            </button>
          ))}
        </div>
      </aside>

      <main className="teams-app__main">
        <header className="teams-app__topbar">
          <div className="teams-app__meeting-meta">
            <h2 className="teams-app__meeting-title">Weekly Product Sync</h2>
            <p className="teams-app__meeting-status">Live meeting in progress</p>
          </div>
          <div className="teams-app__timer" aria-label="Meeting timer">
            {formatTime(elapsedSeconds)}
          </div>
        </header>

        <section className="teams-app__stage">
          <MeetingGrid participants={decoratedParticipants} />

          <MeetingControls
            micOn={micOn}
            cameraOn={cameraOn}
            screenShared={screenShared}
            onToggleMic={handleToggleMic}
            onToggleCamera={handleToggleCamera}
            onToggleScreenShare={handleShareScreen}
            onEndCall={handleEndCall}
          />
        </section>
      </main>
    </div>
  );
}
