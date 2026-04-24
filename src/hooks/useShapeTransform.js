// Custom hook for shape transformations (move, resize, rotate, line-point, poly-point)

import { useRef, useEffect, useCallback } from 'react';
import { TOOLS, SHAPE_TYPES } from '../utils/constants.js';

export function useShapeTransform({
  activeToolRef,
  shapesRef,
  stageRef,
  keepAspectRatioRef,
  setShapes,
  setSelectedId,
  setIsInteracting,
  setActiveHandle
}) {
  const listenersRef = useRef({ onMove: null, onUp: null });
  const rafIdRef = useRef(0);
  const lastPointerRef = useRef(null);

  const cleanupListeners = useCallback(() => {
    const { onMove, onUp } = listenersRef.current;
    if (!onMove || !onUp) return;
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
    window.removeEventListener('touchmove', onMove);
    window.removeEventListener('touchend', onUp);
    window.removeEventListener('touchcancel', onUp);
    window.removeEventListener('blur', onUp);
    listenersRef.current = { onMove: null, onUp: null };

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = 0;
    }
    lastPointerRef.current = null;
  }, []);

  useEffect(() => () => cleanupListeners(), [cleanupListeners]);

  const updateShapeById = useCallback((prevShapes, shapeId, updater) => {
    const idx = prevShapes.findIndex(s => s.id === shapeId);
    if (idx === -1) return prevShapes;
    const current = prevShapes[idx];
    const nextShape = updater(current);
    if (nextShape === current) return prevShapes;
    const nextShapes = prevShapes.slice();
    nextShapes[idx] = nextShape;
    return nextShapes;
  }, []);

  const handleShapeInteraction = useCallback((e, id, mode, extra = null) => {
    if (activeToolRef.current === TOOLS.POLY_DRAW) return;
    if (activeToolRef.current === TOOLS.PAN) return;
    const shape = shapesRef.current.find(s => s.id === id);
    if (!shape || !shape.isVisible) return;
    if (shape.isLocked && mode !== 'select-only') return;

    const isTouch = e.type.startsWith('touch');
    if (isTouch && e.touches.length > 1) {
      // Не запускаем трансформацию фигуры для multi-touch:
      // жест должен обработаться на уровне сцены (pinch/pan).
      return;
    }

    if (e.type === 'touchstart') e.preventDefault();
    e.stopPropagation();
    cleanupListeners();

    setIsInteracting(true);
    setSelectedId(id);

    if (mode === 'select-only') {
      setActiveHandle(null);
      setIsInteracting(false);
      return;
    }
    setActiveHandle({ id, mode, extra });

    const startX = isTouch ? e.touches[0].clientX : e.clientX;
    const startY = isTouch ? e.touches[0].clientY : e.clientY;
    const initial = {
      x: shape.x,
      y: shape.y,
      w: shape.w,
      h: shape.h,
      x2: shape.x2,
      y2: shape.y2,
      rotation: shape.rotation,
      points: Array.isArray(shape.points) ? shape.points.map(p => ({ x: p.x, y: p.y })) : null
    };

    const applyMoveAt = (curX, curY) => {
      const currentStage = stageRef.current;
      const dxGlobal = (curX - startX) / currentStage.scale;
      const dyGlobal = (curY - startY) / currentStage.scale;

      setShapes(prev => updateShapeById(prev, id, (s) => {
        if (mode === 'move') {
          const res = { ...s, x: initial.x + dxGlobal, y: initial.y + dyGlobal };
          if (s.type === 'line') {
            res.x2 = (initial.x2 || 0) + dxGlobal;
            res.y2 = (initial.y2 || 0) + dyGlobal;
          }
          return res;
        }
        if (mode === 'resize') {
          const angleRad = (initial.rotation * Math.PI) / 180;
          const cosA = Math.cos(angleRad);
          const sinA = Math.sin(angleRad);
          const dxLocal = dxGlobal * cosA + dyGlobal * sinA;
          const dyLocal = -dxGlobal * sinA + dyGlobal * cosA;
          let newW = Math.max(20, initial.w + dxLocal * 2);
          let newH = Math.max(20, initial.h + dyLocal * 2);

          if ((keepAspectRatioRef.current || s.type === SHAPE_TYPES.IMAGE) && initial.w !== 0 && initial.h !== 0) {
            const ratio = initial.w / initial.h;
            if (Math.abs(dxLocal) > Math.abs(dyLocal)) newH = newW / ratio;
            else newW = newH * ratio;
          }
          return { ...s, w: newW, h: newH };
        }
        if (mode === 'rotate') {
          const centerX = initial.x + initial.w / 2;
          const centerY = initial.y + initial.h / 2;
          const currentMouseX = (curX - currentStage.x) / currentStage.scale;
          const currentMouseY = (curY - currentStage.y) / currentStage.scale;
          const angle = Math.atan2(currentMouseY - centerY, currentMouseX - centerX);
          return { ...s, rotation: (angle * 180 / Math.PI) + 90 };
        }
        if (mode === 'line-point') {
          return extra === 'start'
            ? { ...s, x: initial.x + dxGlobal, y: initial.y + dyGlobal }
            : { ...s, x2: (initial.x2 || 0) + dxGlobal, y2: (initial.y2 || 0) + dyGlobal };
        }
        if (mode === 'poly-point') {
          const newPoints = [...s.points];
          newPoints[extra] = {
            x: initial.points[extra].x + dxGlobal,
            y: initial.points[extra].y + dyGlobal
          };
          return { ...s, points: newPoints };
        }
        return s;
      }));
    };

    const onMove = (moveEvent) => {
      const isMoveTouch = moveEvent.type.startsWith('touch');
      if (isMoveTouch && moveEvent.touches.length > 1) return;
      const curX = isMoveTouch ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const curY = isMoveTouch ? moveEvent.touches[0].clientY : moveEvent.clientY;

      lastPointerRef.current = { x: curX, y: curY };
      if (rafIdRef.current) return;

      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = 0;
        const latest = lastPointerRef.current;
        if (!latest) return;
        applyMoveAt(latest.x, latest.y);
      });
    };

    const onUp = () => {
      const latest = lastPointerRef.current;
      if (latest) {
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = 0;
        }
        applyMoveAt(latest.x, latest.y);
      }
      cleanupListeners();
      setActiveHandle(null);
      setIsInteracting(false);
      if (mode === 'poly-point') {
        setShapes(prev => updateShapeById(prev, id, (s) => {
          const xs = s.points.map(p => p.x);
          const ys = s.points.map(p => p.y);
          const minX = Math.min(...xs);
          const minY = Math.min(...ys);
          return {
            ...s,
            x: s.x + minX,
            y: s.y + minY,
            w: Math.max(Math.max(...xs) - minX, 1),
            h: Math.max(Math.max(...ys) - minY, 1),
            points: s.points.map(p => ({ x: p.x - minX, y: p.y - minY }))
          };
        }));
      }
    };

    listenersRef.current = { onMove, onUp };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    window.addEventListener('touchcancel', onUp);
    window.addEventListener('blur', onUp);
  }, [activeToolRef, shapesRef, stageRef, keepAspectRatioRef, setShapes, setSelectedId, setIsInteracting, cleanupListeners, updateShapeById, setActiveHandle]);

  return { handleShapeInteraction };
}
