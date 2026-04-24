// LayersPanel component - right side panel showing all layers

import React, { useMemo } from 'react';
import { SHAPE_TYPES } from '../utils/constants.js';

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

const Layers = (props) => <Icon name="layers" {...props} />;
const X = (props) => <Icon name="close" {...props} />;
const Eye = (props) => <Icon name="visibility" {...props} />;
const Lock = (props) => <Icon name="lock" {...props} />;
const Trash2 = (props) => <Icon name="delete" {...props} />;
const Square = (props) => <Icon name="crop_square" {...props} />;
const Circle = (props) => <Icon name="circle" {...props} />;
const Triangle = (props) => <Icon name="change_history" {...props} />;
const Minus = (props) => <Icon name="remove" {...props} />;
const Pentagon = (props) => <Icon name="pentagon" {...props} />;

export const LayersPanel = React.memo(function LayersPanel({
  showLayers,
  shapes,
  selectedId,
  layerColorTarget,
  onSetShowLayers,
  onSetSelectedId,
  onToggleVisibility,
  onToggleLock,
  onDeleteShape,
  onSetLayerColorPickerShapeId,
  onUpdateShapeColor,
  colorPresets
}) {
  const reversedShapes = useMemo(() => [...shapes].reverse(), [shapes]);

  const getShapeIcon = (shape) => {
    if (!shape) return null;
    const defaultColor = shape.stroke || '#9ca3af';
    const props = { size: 18, style: { color: defaultColor } };

    switch(shape.type) {
      case 'rect': return <Square {...props} fill={defaultColor} fillOpacity={0.2} />;
      case 'circle': return <Circle {...props} fill={defaultColor} fillOpacity={0.2} />;
      case 'triangle': return <Triangle {...props} fill={defaultColor} fillOpacity={0.2} />;
      case 'line': return <Minus {...props} className="rotate-45" />;
      case 'poly': return <Pentagon {...props} fill={defaultColor} fillOpacity={0.2} />;
      case 'image': return (
        <img
          src={shape.src}
          className="w-full h-full object-cover rounded-[inherit]"
          style={{
            filter: `hue-rotate(${shape.hue || 0}deg) saturate(${shape.saturation ?? 100}%) brightness(${shape.brightness ?? 100}%) invert(${shape.invert ? 100 : 0}%)`
          }}
          alt="thumb"
        />
      );
      default: return null;
    }
  };

  if (!showLayers) return null;

  return (
    <>
      <div className="absolute inset-y-0 right-0 w-80 bg-[#111]/95 backdrop-blur-xl border-l border-white/10 z-[60] flex flex-col animate-in slide-in-from-right duration-200 shadow-2xl pb-[env(safe-area-inset-bottom)]">
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#111]">
          <div className="flex flex-col">
            <span className="font-bold text-xs text-blue-500 uppercase tracking-widest">Layers</span>
            <span className="text-[10px] text-gray-500 mt-1">{shapes.length} objects</span>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => onSetShowLayers(false)} className="text-gray-500 p-2 hover:bg-white/5 rounded-lg active:scale-90 transition-all">
              <X size={20}/>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {shapes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-20 text-center px-6">
              <Layers size={48} className="mb-4" />
              <p className="text-sm font-medium">No layers</p>
            </div>
          ) : (
            reversedShapes.map(shape => (
              <div
                key={shape.id}
                onClick={(e) => { e.stopPropagation(); onSetSelectedId(shape.id); }}
                className={`flex items-center gap-1.5 p-1.5 rounded-xl transition-all cursor-pointer border ${selectedId === shape.id ? 'bg-blue-600/15 border-blue-500/40' : 'hover:bg-white/5 border-transparent'}`}
              >
                <div className="w-8 flex justify-center shrink-0">
                  <span className={`text-[11px] font-mono font-black ${shape.isVisible ? 'text-gray-400' : 'text-gray-700'}`}>
                    {shape.index}
                  </span>
                </div>
                <label className={`w-10 h-10 flex items-center justify-center shrink-0 rounded-lg border border-white/5 transition-opacity cursor-pointer relative overflow-hidden ${shape.isVisible ? 'opacity-100 bg-white/5' : 'opacity-30'}`}>
                  {getShapeIcon(shape)}
                  {shape.type !== 'image' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetLayerColorPickerShapeId(shape.id);
                      }}
                      className="absolute inset-0"
                      title="Shape color"
                    />
                  )}
                </label>
                <button onClick={(e) => { e.stopPropagation(); onToggleVisibility(shape.id); }} className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all active:scale-90 ${shape.isVisible ? 'text-blue-400 bg-blue-500/10' : 'text-gray-700 bg-white/5'}`}>
                  <Eye size={18}/>
                </button>
                <button onClick={(e) => { e.stopPropagation(); onToggleLock(shape.id); }} className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all active:scale-90 ${shape.isLocked ? 'text-orange-500 bg-orange-500/15' : 'text-gray-700 bg-white/5'}`}>
                  <Lock size={18}/>
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDeleteShape(shape.id); }} className="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-red-500 hover:bg-red-500/15 rounded-lg transition-all active:scale-90">
                  <Trash2 size={18}/>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {layerColorTarget && (
        <div
          className="fixed inset-0 z-[120] bg-black/55 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => onSetLayerColorPickerShapeId(null)}
        >
          <div
            className="w-full max-w-xs bg-[#1f2127] border border-white/10 rounded-3xl p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-white">Choose shape color</span>
              <button
                onClick={() => onSetLayerColorPickerShapeId(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2.5 mb-3">
              {colorPresets.map((color) => (
                <button
                  key={`layer-modal-${color}`}
                  onClick={() => {
                    onUpdateShapeColor(layerColorTarget.id, color);
                    onSetLayerColorPickerShapeId(null);
                  }}
                  className={`w-9 h-9 rounded-full border-2 transition-transform active:scale-90 ${layerColorTarget.stroke === color ? 'border-white scale-105' : 'border-white/20'}`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  onUpdateShapeColor(layerColorTarget.id, 'transparent');
                  onSetLayerColorPickerShapeId(null);
                }}
                className={`px-3 py-2 rounded-lg border text-xs transition-colors ${layerColorTarget.stroke === 'transparent' ? 'bg-blue-500/20 border-blue-400/60 text-blue-300' : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'}`}
              >
                No stroke
              </button>
              <button
                onClick={() => onSetLayerColorPickerShapeId(null)}
                className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-xs text-gray-300 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
