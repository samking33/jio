/**
 * WindowContext
 * ─────────────
 * Central state for the Virtual Desktop window system.
 *
 * Each window is described by:
 *   id        – unique string (uuid)
 *   appId     – which app this window belongs to (e.g. "rfp", "meeting")
 *   title     – title bar text
 *   isOpen    – visible on desktop
 *   isMinimized – collapsed to taskbar
 *   isMaximized – fills the desktop
 *   position  – { x, y } in px from top-left of desktop
 *   size      – { width, height } in px
 *   zIndex    – stacking order
 */

import React, { createContext, useContext, useReducer, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState = {
  windows: [],          // array of window objects (see shape above)
  activeWindowId: null, // id of the focused window
  nextZ: 10,            // ever-incrementing z-index counter
};

// ─── Action types ─────────────────────────────────────────────────────────────

export const WIN = {
  OPEN:      "WIN/OPEN",
  CLOSE:     "WIN/CLOSE",
  FOCUS:     "WIN/FOCUS",
  MINIMIZE:  "WIN/MINIMIZE",
  MAXIMIZE:  "WIN/MAXIMIZE",
  RESTORE:   "WIN/RESTORE",
  MOVE:      "WIN/MOVE",
  RESIZE:    "WIN/RESIZE",
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function windowReducer(state, action) {
  switch (action.type) {

    case WIN.OPEN: {
      const { appId, title, position, size } = action.payload;

      // If a window for this appId already exists, just focus it
      const existing = state.windows.find(w => w.appId === appId);
      if (existing) {
        return {
          ...state,
          activeWindowId: existing.id,
          nextZ: state.nextZ + 1,
          windows: state.windows.map(w =>
            w.id === existing.id
              ? { ...w, isMinimized: false, zIndex: state.nextZ }
              : w
          ),
        };
      }

      const newWindow = {
        id:          uuidv4(),
        appId,
        title,
        isOpen:      true,
        isMinimized: false,
        isMaximized: false,
        position:    position ?? { x: 80 + state.windows.length * 30, y: 60 + state.windows.length * 30 },
        size:        size     ?? { width: 860, height: 540 },
        zIndex:      state.nextZ,
      };

      return {
        ...state,
        windows:       [...state.windows, newWindow],
        activeWindowId: newWindow.id,
        nextZ:          state.nextZ + 1,
      };
    }

    case WIN.CLOSE:
      return {
        ...state,
        windows:       state.windows.filter(w => w.id !== action.payload.id),
        activeWindowId: state.activeWindowId === action.payload.id ? null : state.activeWindowId,
      };

    case WIN.FOCUS: {
      const { id } = action.payload;
      return {
        ...state,
        activeWindowId: id,
        nextZ: state.nextZ + 1,
        windows: state.windows.map(w =>
          w.id === id ? { ...w, zIndex: state.nextZ } : w
        ),
      };
    }

    case WIN.MINIMIZE:
      return {
        ...state,
        activeWindowId: null,
        windows: state.windows.map(w =>
          w.id === action.payload.id ? { ...w, isMinimized: true } : w
        ),
      };

    case WIN.MAXIMIZE:
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload.id ? { ...w, isMaximized: true } : w
        ),
      };

    case WIN.RESTORE:
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload.id
            ? { ...w, isMinimized: false, isMaximized: false }
            : w
        ),
      };

    case WIN.MOVE:
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload.id
            ? { ...w, position: action.payload.position }
            : w
        ),
      };

    case WIN.RESIZE:
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload.id
            ? { ...w, size: action.payload.size }
            : w
        ),
      };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const WindowContext = createContext(null);

export function WindowProvider({ children }) {
  const [state, dispatch] = useReducer(windowReducer, initialState);

  /* Convenience action creators exposed to consumers */
  const openWindow   = useCallback((appId, title, opts = {}) =>
    dispatch({ type: WIN.OPEN,     payload: { appId, title, ...opts } }), []);
  const closeWindow  = useCallback(id =>
    dispatch({ type: WIN.CLOSE,    payload: { id } }), []);
  const focusWindow  = useCallback(id =>
    dispatch({ type: WIN.FOCUS,    payload: { id } }), []);
  const minimizeWindow = useCallback(id =>
    dispatch({ type: WIN.MINIMIZE, payload: { id } }), []);
  const maximizeWindow = useCallback(id =>
    dispatch({ type: WIN.MAXIMIZE, payload: { id } }), []);
  const restoreWindow  = useCallback(id =>
    dispatch({ type: WIN.RESTORE,  payload: { id } }), []);
  const moveWindow   = useCallback((id, position) =>
    dispatch({ type: WIN.MOVE,     payload: { id, position } }), []);
  const resizeWindow = useCallback((id, size) =>
    dispatch({ type: WIN.RESIZE,   payload: { id, size } }), []);

  return (
    <WindowContext.Provider value={{
      windows:        state.windows,
      activeWindowId: state.activeWindowId,
      openWindow,
      closeWindow,
      focusWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      moveWindow,
      resizeWindow,
    }}>
      {children}
    </WindowContext.Provider>
  );
}

/** Hook for consuming window state anywhere in the tree */
export function useWindows() {
  const ctx = useContext(WindowContext);
  if (!ctx) throw new Error("useWindows must be used inside <WindowProvider>");
  return ctx;
}
