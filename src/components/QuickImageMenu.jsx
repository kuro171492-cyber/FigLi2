// QuickImageMenu component - radial menu for quick image adjustments

import React from 'react';
import { SHAPE_TYPES, QUICK_MENU_START_ANGLE, QUICK_MENU_END_ANGLE, QUICK_MENU_SWEEP } from '../utils/constants.js';
import { polarToCartesian, describeArcPath } from '../utils/geometry.js';

export const QuickImageMenu = React.memo(function QuickImageMenu({
  imageQuickMenu,
  quickImageTarget,
  onSetImageQuickMenu,
  onApplyTransparencyFromPoint,
  onApplyHSLFromPoint,
  getQuickControlConfig
}) {
  if (!imageQuickMenu || !quickImageTarget) return null;

  const controls = [
    { key: 'hue', label: 'H', angle: 210 },
    { key: 'saturation', label: 'S', angle: 250 },
    { key: 'lightness', label: 'L', angle: 290 },
    { key: 'transparency', label: 'Tr', angle: 330 }
  ];
  const center = 160;
  const buttonRadius = 100;

  const renderControlButtons = () => {
    return controls.map((control) => {
      const point = polarToCartesian(center, center, buttonRadius, control.angle);
      const isActive = imageQuickMenu.control === control.key;
      return (
        <button
          key={control.key}
          onClick={() => onSetImageQuickMenu((prev) => prev ? { ...prev, control: control.key } : prev)}
          className={`absolute w-16 h-16 rounded-full border bg-[#242826] ${isActive ? 'border-cyan-300 text-cyan-300' : 'border-white/10 text-cyan-400'} text-lg font-semibold`}
          style={{ left: point.x, top: point.y, transform: 'translate(-50%, -50%)' }}
        >
          {control.label}
        </button>
      );
    });
  };

  const renderTransparencyArc = () => {
    const arcRadius = 135;
    const cfg = getQuickControlConfig('transparency', quickImageTarget);
    const transparencyValue = cfg ? cfg.value : 0;
    const angle = QUICK_MENU_END_ANGLE - (transparencyValue / 100) * QUICK_MENU_SWEEP;
    const knob = polarToCartesian(center, center, arcRadius, angle);
    const backgroundArc = describeArcPath(center, center, arcRadius, QUICK_MENU_START_ANGLE, QUICK_MENU_END_ANGLE);
    const valueArc = describeArcPath(center, center, arcRadius, angle, QUICK_MENU_END_ANGLE);

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        viewBox="0 0 320 320"
        onMouseDown={(e) => onApplyTransparencyFromPoint(e.clientX, e.clientY)}
        onMouseMove={(e) => { if (e.buttons === 1) onApplyTransparencyFromPoint(e.clientX, e.clientY); }}
        onTouchStart={(e) => { if (e.touches && e.touches[0]) onApplyTransparencyFromPoint(e.touches[0].clientX, e.touches[0].clientY); }}
        onTouchMove={(e) => { if (e.touches && e.touches[0]) onApplyTransparencyFromPoint(e.touches[0].clientX, e.touches[0].clientY); }}
      >
        <path d={backgroundArc} stroke="rgba(255,255,255,0.16)" strokeWidth="20" fill="none" strokeLinecap="round" />
        <path d={valueArc} stroke="#22d3ee" strokeWidth="20" fill="none" strokeLinecap="round" />
        <circle cx={knob.x} cy={knob.y} r="11" fill="#111827" stroke="#22d3ee" strokeWidth="3" />
      </svg>
    );
  };

  const renderHSLArc = () => {
    const control = imageQuickMenu.control;
    const cfg = getQuickControlConfig(control, quickImageTarget);
    if (!cfg) return null;

    const arcRadius = 135;
    const currentValue = cfg.value;
    const normalizedValue = (currentValue - cfg.min) / (cfg.max - cfg.min);
    const angle = QUICK_MENU_START_ANGLE + normalizedValue * QUICK_MENU_SWEEP;
    const knob = polarToCartesian(center, center, arcRadius, angle);
    const backgroundArc = describeArcPath(center, center, arcRadius, QUICK_MENU_START_ANGLE, QUICK_MENU_END_ANGLE);
    const valueArc = describeArcPath(center, center, arcRadius, QUICK_MENU_START_ANGLE, angle);

    let arcColor = '#22d3ee';
    if (control === 'hue') arcColor = '#f472b6';
    if (control === 'saturation') arcColor = '#a78bfa';
    if (control === 'lightness') arcColor = '#fbbf24';

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        viewBox="0 0 320 320"
        onMouseDown={(e) => onApplyHSLFromPoint(e.clientX, e.clientY, control)}
        onMouseMove={(e) => { if (e.buttons === 1) onApplyHSLFromPoint(e.clientX, e.clientY, control); }}
        onTouchStart={(e) => { if (e.touches && e.touches[0]) onApplyHSLFromPoint(e.touches[0].clientX, e.touches[0].clientY, control); }}
        onTouchMove={(e) => { if (e.touches && e.touches[0]) onApplyHSLFromPoint(e.touches[0].clientX, e.touches[0].clientY, control); }}
      >
        <path d={backgroundArc} stroke="rgba(255,255,255,0.16)" strokeWidth="20" fill="none" strokeLinecap="round" />
        <path d={valueArc} stroke={arcColor} strokeWidth="20" fill="none" strokeLinecap="round" />
        <circle cx={knob.x} cy={knob.y} r="11" fill="#111827" stroke={arcColor} strokeWidth="3" />
      </svg>
    );
  };

  const renderValueLabel = () => {
    if (imageQuickMenu.control === 'transparency') {
      const cfg = getQuickControlConfig('transparency', quickImageTarget);
      if (!cfg) return null;
      return (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-[120] text-cyan-300 text-sm font-mono bg-[#1d1f25]/90 border border-white/10 px-3 py-1.5 rounded-lg">
          Transparency: {Math.round(cfg.value)}%
        </div>
      );
    }

    if (['hue', 'saturation', 'lightness'].includes(imageQuickMenu.control)) {
      const cfg = getQuickControlConfig(imageQuickMenu.control, quickImageTarget);
      if (!cfg) return null;

      let labelColor = 'text-cyan-300';
      if (imageQuickMenu.control === 'hue') labelColor = 'text-pink-400';
      if (imageQuickMenu.control === 'saturation') labelColor = 'text-purple-400';
      if (imageQuickMenu.control === 'lightness') labelColor = 'text-amber-400';

      return (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-[120] text-sm font-mono bg-[#1d1f25]/90 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <span className="text-gray-400">{cfg.label}:</span>
          <span className={`${labelColor} font-bold`}>{Math.round(cfg.value)}{cfg.suffix}</span>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div className="fixed inset-0 z-[115]" onClick={(e) => { e.stopPropagation(); onSetImageQuickMenu(null); }} />
      <div
        className="fixed z-[116] pointer-events-auto"
        style={{ left: imageQuickMenu.x, top: imageQuickMenu.y, transform: 'translate(-50%, -50%)' }}
      >
        <div className="relative w-80 h-80">
          {renderControlButtons()}

          {imageQuickMenu.control === 'transparency' && renderTransparencyArc()}

          {['hue', 'saturation', 'lightness'].includes(imageQuickMenu.control) && renderHSLArc()}

          <button
            onClick={() => onSetImageQuickMenu(null)}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-white/10 text-black bg-[#2d322f] text-xl font-bold z-10"
          >X</button>
        </div>
      </div>
      {renderValueLabel()}
    </>
  );
});
