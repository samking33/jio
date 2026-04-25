/**
 * useDrag
 * ───────
 * Generic mouse-drag hook.  Used by the Window title bar to allow
 * repositioning windows by dragging.
 *
 * Usage:
 *   const { onMouseDown } = useDrag(position, (newPos) => moveWindow(id, newPos));
 *
 * Attach `onMouseDown` to the drag handle element.
 */

import { useCallback, useRef } from "react";

export function useDrag(currentPosition, onPositionChange) {
  // Store drag origin in a ref so we don't re-create the handlers on every render
  const dragRef = useRef(null);

  const onMouseDown = useCallback((e) => {
    // Only respond to left-button drags; ignore clicks on buttons inside the handle
    if (e.button !== 0) return;
    if (e.target.closest("button")) return;

    e.preventDefault();

    dragRef.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startWinX:   currentPosition.x,
      startWinY:   currentPosition.y,
    };

    const onMouseMove = (moveEvent) => {
      if (!dragRef.current) return;
      const dx = moveEvent.clientX - dragRef.current.startMouseX;
      const dy = moveEvent.clientY - dragRef.current.startMouseY;

      onPositionChange({
        x: Math.max(0, dragRef.current.startWinX + dx),
        y: Math.max(0, dragRef.current.startWinY + dy),
      });
    };

    const onMouseUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);
  }, [currentPosition, onPositionChange]);

  return { onMouseDown };
}
