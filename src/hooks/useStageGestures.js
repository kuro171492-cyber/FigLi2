// Custom hook for stage gestures (pan, pinch-to-zoom)

import { useRef, useEffect, useCallback } from 'react';
import { TOOLS } from '../utils/constants.js';

export function useStageGestures({ activeToolRef, touchState, stageRef, setStage, containerRef }) {
  const rafIdRef = useRef(0);
  const nextStageRef = useRef(null);

  const flushStageUpdate = useCallback(() => {
    rafIdRef.current = 0;
    const payload = nextStageRef.current;
    if (!payload) return;
    nextStageRef.current = null;

    if (payload.type === 'pan') {
      setStage(s => ({ ...s, x: payload.x, y: payload.y }));
      return;
    }

    if (payload.type === 'pinch') {
      setStage({ scale: payload.scale, x: payload.x, y: payload.y });
    }
  }, [setStage]);

  const scheduleStageUpdate = useCallback((payload) => {
    nextStageRef.current = payload;
    if (rafIdRef.current) return;
    rafIdRef.current = requestAnimationFrame(flushStageUpdate);
  }, [flushStageUpdate]);

  const cancelScheduledStageUpdate = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = 0;
    }
    nextStageRef.current = null;
  }, []);

  useEffect(() => () => cancelScheduledStageUpdate(), [cancelScheduledStageUpdate]);

  const handleCanvasTouchStart = useCallback((e) => {
    if (activeToolRef.current === TOOLS.POLY_DRAW) return;
    const currentStage = stageRef.current;

    if (e.touches.length === 1 && activeToolRef.current === TOOLS.PAN) {
      e.preventDefault();
      cancelScheduledStageUpdate();
      const touch = e.touches[0];
      touchState.current = {
        initialDist: 0,
        initialScale: currentStage.scale,
        initialX: touch.clientX,
        initialY: touch.clientY,
        initialStageX: currentStage.x,
        initialStageY: currentStage.y
      };
    } else if (e.touches.length === 2) {
      e.preventDefault();
      cancelScheduledStageUpdate();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;
      touchState.current = {
        initialDist: dist,
        initialScale: currentStage.scale,
        initialX: midX,
        initialY: midY,
        initialStageX: currentStage.x,
        initialStageY: currentStage.y
      };
    }
  }, [activeToolRef, touchState, stageRef, cancelScheduledStageUpdate]);

  const handleCanvasTouchMove = useCallback((e) => {
    if (activeToolRef.current === TOOLS.POLY_DRAW) return;

    if (e.touches.length === 1 && activeToolRef.current === TOOLS.PAN) {
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - touchState.current.initialX;
      const dy = touch.clientY - touchState.current.initialY;
      scheduleStageUpdate({
        type: 'pan',
        x: touchState.current.initialStageX + dx,
        y: touchState.current.initialStageY + dy
      });
    } else if (e.touches.length === 2) {
      e.preventDefault();
      const currentStage = stageRef.current;
      if (!touchState.current.initialDist || !touchState.current.initialScale) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;
        touchState.current = {
          initialDist: dist,
          initialScale: currentStage.scale,
          initialX: midX,
          initialY: midY,
          initialStageX: currentStage.x,
          initialStageY: currentStage.y
        };
        return;
      }
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;
      const scaleChange = dist / touchState.current.initialDist;
      const newScale = Math.min(Math.max(0.1, touchState.current.initialScale * scaleChange), 5);
      const rect = containerRef.current.getBoundingClientRect();
      const originX = midX - rect.left;
      const originY = midY - rect.top;
      const dx = (originX - touchState.current.initialStageX) * (newScale / touchState.current.initialScale);
      const dy = (originY - touchState.current.initialStageY) * (newScale / touchState.current.initialScale);
      if (!Number.isFinite(newScale) || !Number.isFinite(dx) || !Number.isFinite(dy)) return;
      scheduleStageUpdate({
        type: 'pinch',
        scale: newScale,
        x: originX - dx,
        y: originY - dy
      });
    }
  }, [activeToolRef, touchState, containerRef, scheduleStageUpdate, stageRef]);

  const handleCanvasTouchEnd = useCallback((e) => {
    if (nextStageRef.current) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = 0;
      }
      flushStageUpdate();
    }

    const currentStage = stageRef.current;
    if (e && e.touches && e.touches.length === 1 && activeToolRef.current === TOOLS.PAN) {
      // После завершения pinch пересобираем baseline, чтобы не было рывка при продолжении pan одним пальцем.
      const touch = e.touches[0];
      touchState.current = {
        initialX: touch.clientX,
        initialY: touch.clientY,
        initialStageX: currentStage.x,
        initialStageY: currentStage.y
      };
      return;
    }

    if (!e || !e.touches || e.touches.length === 0) {
      touchState.current = {
        initialDist: 0,
        initialScale: currentStage.scale,
        initialX: 0,
        initialY: 0,
        initialStageX: currentStage.x,
        initialStageY: currentStage.y
      };
    }
  }, [flushStageUpdate, activeToolRef, stageRef, touchState]);

  const handleCanvasTouchCancel = useCallback(() => {
    handleCanvasTouchEnd();
  }, [handleCanvasTouchEnd]);

  return { handleCanvasTouchStart, handleCanvasTouchMove, handleCanvasTouchEnd, handleCanvasTouchCancel };
}
