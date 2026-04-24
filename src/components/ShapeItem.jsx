// ShapeItem component - renders individual shapes on the canvas

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { SHAPE_TYPES } from '../utils/constants.js';
import { renderLineWithDivisions } from '../utils/helpers.js';

const Icon = ({ name, size = 16, className = "", style = {}, ...rest }) => (
  <span
    className={`material-symbols-outlined ${className}`.trim()}
    style={{
      fontSize: size,
      lineHeight: 1,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      verticalAlign: "middle",
      userSelect: "none",
      ...style
    }}
    {...rest}
  >
    {name}
  </span>
);

const RotateCw = (props) => <Icon name="refresh" {...props} />;
const Lock = (props) => <Icon name="lock" {...props} />;
const Unlock = (props) => <Icon name="lock_open" {...props} />;

export const ShapeItem = React.memo(function ShapeItem({ 
  shape, 
  isSelected, 
  onShapeInteraction, 
  onToggleLock, 
  stageScale = 1, 
  activeHandle = null,
  onImageLongPress = null 
}) {
  const isLine = shape.type === 'line';
  const isPoly = shape.type === 'poly';
  const isImage = shape.type === 'image';
  const canRotate = shape.type !== 'line' && shape.type !== 'poly';
  const safeScale = Math.max(stageScale, 0.01);
  const inverseScale = 1 / safeScale;
  const showCrosshairHandles = safeScale > 2;

  const isHandleActive = useCallback((mode, extra = null) => (
    isSelected &&
    activeHandle &&
    activeHandle.id === shape.id &&
    activeHandle.mode === mode &&
    activeHandle.extra === extra
  ), [isSelected, activeHandle, shape.id]);

  const renderHandleGlyph = useCallback((isActive) => {
    if (showCrosshairHandles) {
      return (
        <div className="relative w-4 h-4">
          <div className={`absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 ${isActive ? 'bg-yellow-300' : 'bg-white'} shadow-[0_0_0_1px_rgba(59,130,246,0.9)]`} />
          <div className={`absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 ${isActive ? 'bg-yellow-300' : 'bg-white'} shadow-[0_0_0_1px_rgba(59,130,246,0.9)]`} />
        </div>
      );
    }
    return (
      <div className={`w-4 h-4 border-2 rounded-full shadow-lg ${isActive ? 'bg-yellow-300 border-yellow-500 ring-2 ring-yellow-400/70' : 'bg-white border-blue-500'}`} />
    );
  }, [showCrosshairHandles]);

  const longPressTimerRef = useRef(null);
  const touchStartRef = useRef(null);

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    touchStartRef.current = null;
  }, []);

  const startImageLongPress = useCallback((clientX, clientY) => {
    if (!isImage || !onImageLongPress) return;
    clearLongPress();
    touchStartRef.current = { x: clientX, y: clientY };
    longPressTimerRef.current = setTimeout(() => {
      onImageLongPress(shape.id, { x: clientX, y: clientY });
      clearLongPress();
    }, 2000);
  }, [isImage, onImageLongPress, shape.id, clearLongPress]);

  const moveImageLongPress = useCallback((clientX, clientY) => {
    if (!touchStartRef.current) return;
    const dist = Math.hypot(clientX - touchStartRef.current.x, clientY - touchStartRef.current.y);
    if (dist > 10) clearLongPress();
  }, [clearLongPress]);

  useEffect(() => () => clearLongPress(), [clearLongPress]);

  const shapeStyle = useMemo(() => (
    isLine
      ? {
          left: Math.min(shape.x, shape.x2),
          top: Math.min(shape.y, shape.y2),
          width: Math.max(Math.abs(shape.x2 - shape.x), 1),
          height: Math.max(Math.abs(shape.y2 - shape.y), 1)
        }
      : {
          left: shape.x,
          top: shape.y,
          width: shape.w,
          height: shape.h
        }
  ), [isLine, shape.x, shape.y, shape.x2, shape.y2, shape.w, shape.h]);

  const imageFilter = useMemo(
    () => `hue-rotate(${shape.hue || 0}deg) saturate(${shape.saturation ?? 100}%) brightness(${shape.brightness ?? 100}%) invert(${shape.invert ? 100 : 0}%)`,
    [shape.hue, shape.saturation, shape.brightness, shape.invert]
  );

  return (
    <div
      className={`absolute ${isImage ? 'z-0' : (isSelected ? 'z-20' : 'z-10')} touch-none`}
      onMouseDown={(e) => onShapeInteraction(e, shape.id, shape.isLocked ? 'select-only' : 'move')}
      onTouchStart={(e) => onShapeInteraction(e, shape.id, shape.isLocked ? 'select-only' : 'move')}
      style={{
        ...shapeStyle,
        opacity: shape.opacity / 100,
        transform: isLine ? 'none' : `rotate(${shape.rotation}deg)`,
        transformOrigin: 'center center',
        outline: isSelected ? `2px solid ${shape.isLocked ? '#fb923c' : '#3b82f6'}` : 'none',
        outlineOffset: '2px',
        pointerEvents: 'auto',
        cursor: shape.isLocked ? 'default' : 'move'
      }}
    >
      {isImage ? (
        <img
          src={shape.src}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          onTouchStart={(e) => {
            if (!e.touches || !e.touches[0]) return;
            startImageLongPress(e.touches[0].clientX, e.touches[0].clientY);
          }}
          onTouchMove={(e) => {
            if (!e.touches || !e.touches[0]) return;
            moveImageLongPress(e.touches[0].clientX, e.touches[0].clientY);
          }}
          onTouchEnd={clearLongPress}
          onTouchCancel={clearLongPress}
          onMouseDown={(e) => startImageLongPress(e.clientX, e.clientY)}
          onMouseMove={(e) => moveImageLongPress(e.clientX, e.clientY)}
          onMouseUp={clearLongPress}
          onMouseLeave={clearLongPress}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'fill',
            display: 'block',
            filter: imageFilter,
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none'
          }}
          draggable={false}
          alt="Layer"
        />
      ) : (
        <svg width="100%" height="100%" viewBox={`0 0 ${shapeStyle.width} ${shapeStyle.height}`} preserveAspectRatio="none" className="overflow-visible block">
          {shape.type === 'rect' && <rect width="100%" height="100%" fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />}
          {shape.type === 'circle' && <ellipse cx="50%" cy="50%" rx="50%" ry="50%" fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />}
          {shape.type === 'triangle' && <polygon points={`${shape.w/2},0 ${shape.w},${shape.h} 0,${shape.h}`} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />}
          {isLine && renderLineWithDivisions(shape, shapeStyle)}
          {isPoly && (
            <polygon
              points={shape.points.map(p => `${p.x},${p.y}`).join(' ')}
              fill={shape.isClosed ? shape.fill : 'transparent'}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
            />
          )}
        </svg>
      )}

      {isSelected && !shape.isLocked && (
        <>
          <button
            className="absolute -top-10 -right-2 p-2 rounded-full shadow-lg border-2 border-[#0a0a0a] transition-all active:scale-95 bg-[#222] text-gray-400 hover:text-white pointer-events-auto"
            style={{ transform: `scale(${inverseScale})`, transformOrigin: 'top right' }}
            onClick={(e) => { e.stopPropagation(); onToggleLock(shape.id); }}
          >
            <Unlock size={14} />
          </button>
          {canRotate && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto" onMouseDown={(e) => onShapeInteraction(e, shape.id, 'rotate')} onTouchStart={(e) => onShapeInteraction(e, shape.id, 'rotate')}>
              <div className="w-0.5 h-4 bg-blue-500" />
              <div className="w-6 h-6 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center text-blue-500 shadow-lg cursor-alias"><RotateCw size={10} /></div>
            </div>
          )}

          {isPoly && shape.points.map((p, idx) => (
            <div
              key={idx}
              className="absolute w-8 h-8 flex items-center justify-center cursor-crosshair z-30 pointer-events-auto"
              style={{ left: p.x, top: p.y, transform: `translate(-50%, -50%) scale(${inverseScale})` }}
              onMouseDown={(e) => onShapeInteraction(e, shape.id, 'poly-point', idx)}
              onTouchStart={(e) => onShapeInteraction(e, shape.id, 'poly-point', idx)}
            >
              {renderHandleGlyph(isHandleActive('poly-point', idx))}
            </div>
          ))}

          {isLine && (
            <>
              <div
                className="absolute w-8 h-8 flex items-center justify-center pointer-events-auto"
                style={{
                  left: shape.x <= shape.x2 ? 0 : shapeStyle.width,
                  top: shape.y <= shape.y2 ? 0 : shapeStyle.height,
                  transform: `translate(-50%, -50%) scale(${inverseScale})`
                }}
                onMouseDown={(e) => onShapeInteraction(e, shape.id, 'line-point', 'start')}
                onTouchStart={(e) => onShapeInteraction(e, shape.id, 'line-point', 'start')}
              >
                {renderHandleGlyph(isHandleActive('line-point', 'start'))}
              </div>
              <div
                className="absolute w-8 h-8 flex items-center justify-center pointer-events-auto"
                style={{
                  left: shape.x > shape.x2 ? 0 : shapeStyle.width,
                  top: shape.y > shape.y2 ? 0 : shapeStyle.height,
                  transform: `translate(-50%, -50%) scale(${inverseScale})`
                }}
                onMouseDown={(e) => onShapeInteraction(e, shape.id, 'line-point', 'end')}
                onTouchStart={(e) => onShapeInteraction(e, shape.id, 'line-point', 'end')}
              >
                {renderHandleGlyph(isHandleActive('line-point', 'end'))}
              </div>
            </>
          )}

          {!isLine && !isPoly && (
            <div
              className="absolute w-8 h-8 flex items-center justify-center cursor-se-resize pointer-events-auto"
              style={{
                left: shapeStyle.width,
                top: shapeStyle.height,
                transform: `translate(-50%, -50%) scale(${inverseScale})`
              }}
              onMouseDown={(e) => onShapeInteraction(e, shape.id, 'resize')}
              onTouchStart={(e) => onShapeInteraction(e, shape.id, 'resize')}
            >
              {renderHandleGlyph(isHandleActive('resize'))}
            </div>
          )}
        </>
      )}

      {isSelected && shape.isLocked && (
        <button
          className="absolute -top-10 -right-2 p-2 rounded-full shadow-lg border-2 border-[#0a0a0a] transition-all active:scale-95 bg-orange-500 text-white pointer-events-auto"
          style={{ transform: `scale(${inverseScale})`, transformOrigin: 'top right' }}
          onClick={(e) => { e.stopPropagation(); onToggleLock(shape.id); }}
        >
          <Lock size={14} />
        </button>
      )}
    </div>
  );
});
