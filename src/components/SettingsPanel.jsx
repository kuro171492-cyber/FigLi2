// SettingsPanel component - bottom panel for editing shape properties

import React from 'react';
import { SHAPE_TYPES, COLOR_PRESETS } from '../utils/constants.js';

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

const X = (props) => <Icon name="close" {...props} />;
const Hash = (props) => <Icon name="tag" {...props} />;
const Palette = (props) => <Icon name="palette" {...props} />;
const Droplets = (props) => <Icon name="water_drop" {...props} />;
const Sun = (props) => <Icon name="light_mode" {...props} />;
const PenTool = (props) => <Icon name="draw" {...props} />;
const Type = (props) => <Icon name="opacity" {...props} />;
const Lock = (props) => <Icon name="lock" {...props} />;
const Unlock = (props) => <Icon name="lock_open" {...props} />;
const Trash2 = (props) => <Icon name="delete" {...props} />;

export const SettingsPanel = React.memo(function SettingsPanel({
  showSettings,
  selectedShape,
  selectedId,
  supportsFill,
  onSetShowSettings,
  onUpdateSelectedShape,
  onUpdateSelectedStroke,
  onUpdateSelectedFill,
  onToggleLock,
  onDeleteShape
}) {
  if (!selectedShape || !showSettings) return null;

  return (
    <div
      className="absolute inset-x-0 bottom-0 bg-[#1a1a1a] rounded-t-3xl border-t border-white/10 z-[100] pt-4 px-6 animate-in slide-in-from-bottom duration-200 shadow-2xl overflow-y-auto max-h-[85vh]"
      style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom))' }}
    >
      <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0 cursor-pointer" onClick={() => onSetShowSettings(false)} />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 overflow-hidden">
            {/* Shape icon would be rendered here */}
          </div>
          <h3 className="text-sm font-bold">Properties #{selectedShape.index}</h3>
        </div>
        <button onClick={() => onSetShowSettings(false)} className="p-2 text-gray-500 hover:text-white bg-white/5 rounded-full transition-all">
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {selectedShape.type === 'line' && (
          <div className="bg-white/5 p-4 rounded-2xl space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <Hash size={18} className="text-blue-500" />
              <span className="text-sm font-medium">Divisions count ({selectedShape.divisions + 1})</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 font-mono w-4">1</span>
              <input 
                type="range" 
                min="1" 
                max="6" 
                step="1" 
                className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none accent-blue-500" 
                value={selectedShape.divisions || 1} 
                onChange={e => onUpdateSelectedShape(s => ({ ...s, divisions: Number(e.target.value) }))} 
                onClick={e => e.stopPropagation()} 
              />
              <span className="text-xs text-gray-500 font-mono w-4">6</span>
            </div>
          </div>
        )}

        {/* Filters block for images */}
        {selectedShape.type === 'image' && (
          <div className="bg-white/5 p-4 rounded-2xl space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Color correction</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateSelectedShape(s => ({ ...s, invert: !s.invert }));
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedShape.invert ? 'bg-white text-black' : 'bg-[#222] text-gray-300 hover:bg-[#333]'}`}
              >
                Invert
              </button>
            </div>

            <div className="flex items-center gap-3">
              <Palette size={16} className="text-gray-500" />
              <div className="flex-1">
                <div className="flex justify-between text-[10px] text-gray-500 mb-1"><span>Hue</span><span>{selectedShape.hue || 0}°</span></div>
                <input 
                  type="range" 
                  min="0" 
                  max="360" 
                  value={selectedShape.hue || 0} 
                  onChange={e => onUpdateSelectedShape(s => ({ ...s, hue: Number(e.target.value) }))} 
                  className="w-full h-1.5 rounded-lg appearance-none" 
                  style={{ background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }} 
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Droplets size={16} className="text-gray-500" />
              <div className="flex-1">
                <div className="flex justify-between text-[10px] text-gray-500 mb-1"><span>Saturation</span><span>{selectedShape.saturation ?? 100}%</span></div>
                <input 
                  type="range" 
                  min="0" 
                  max="200" 
                  value={selectedShape.saturation ?? 100} 
                  onChange={e => onUpdateSelectedShape(s => ({ ...s, saturation: Number(e.target.value) }))} 
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none accent-blue-500" 
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Sun size={16} className="text-gray-500" />
              <div className="flex-1">
                <div className="flex justify-between text-[10px] text-gray-500 mb-1"><span>Brightness</span><span>{selectedShape.brightness ?? 100}%</span></div>
                <input 
                  type="range" 
                  min="0" 
                  max="200" 
                  value={selectedShape.brightness ?? 100} 
                  onChange={e => onUpdateSelectedShape(s => ({ ...s, brightness: Number(e.target.value) }))} 
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none accent-blue-500" 
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Show color picker for non-image shapes */}
          {selectedShape.type !== 'image' && (
            <div className="bg-white/5 p-4 rounded-2xl space-y-4 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PenTool size={16} className="text-gray-400" />
                  <span className="text-xs text-gray-300">Stroke</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-8 h-8 bg-transparent border-0 cursor-pointer"
                    value={selectedShape.stroke === 'transparent' ? '#ffffff' : selectedShape.stroke}
                    onChange={e => onUpdateSelectedStroke(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    title="Custom stroke color"
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); onUpdateSelectedStroke('transparent'); }}
                    className={`px-2 py-1 text-[10px] rounded-md border transition-colors ${selectedShape.stroke === 'transparent' ? 'bg-blue-500/20 border-blue-400/50 text-blue-300' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
                  >
                    None
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={`stroke-${color}`}
                    onClick={(e) => { e.stopPropagation(); onUpdateSelectedStroke(color); }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform active:scale-90 ${selectedShape.stroke === color ? 'border-white scale-105' : 'border-white/20'}`}
                    style={{ backgroundColor: color }}
                    title={`Stroke ${color}`}
                  />
                ))}
              </div>

              {supportsFill && (
                <>
                  <div className="h-px bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets size={16} className="text-gray-400" />
                      <span className="text-xs text-gray-300">Fill</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="w-8 h-8 bg-transparent border-0 cursor-pointer"
                        value={selectedShape.fill === 'transparent' ? '#ffffff' : selectedShape.fill}
                        onChange={e => onUpdateSelectedFill(e.target.value)}
                        onClick={e => e.stopPropagation()}
                        title="Custom fill color"
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); onUpdateSelectedFill('transparent'); }}
                        className={`px-2 py-1 text-[10px] rounded-md border transition-colors ${selectedShape.fill === 'transparent' ? 'bg-blue-500/20 border-blue-400/50 text-blue-300' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
                      >
                        None
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={`fill-${color}`}
                        onClick={(e) => { e.stopPropagation(); onUpdateSelectedFill(color); }}
                        className={`w-7 h-7 rounded-full border-2 transition-transform active:scale-90 ${selectedShape.fill === color ? 'border-white scale-105' : 'border-white/20'}`}
                        style={{ backgroundColor: color }}
                        title={`Fill ${color}`}
                      />
                    ))}
                  </div>
                </>
              )}

              <div className="h-px bg-white/10" />
              <div className="flex items-center gap-3">
                <Type size={16} className="text-gray-500" />
                <span className="text-[10px] text-gray-500 w-12">Opacity</span>
                <input 
                  type="range" 
                  className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none accent-blue-500" 
                  value={selectedShape.opacity} 
                  onChange={e => onUpdateSelectedShape(s => ({ ...s, opacity: Number(e.target.value) }))} 
                  onClick={e => e.stopPropagation()} 
                />
              </div>
            </div>
          )}

          {/* Show only opacity control for images */}
          {selectedShape.type === 'image' && (
            <div className="flex items-center justify-between gap-4 bg-white/5 p-2 rounded-2xl">
               <div className="flex-1 flex items-center gap-3 px-3">
                 <Type size={18} className="text-gray-500" />
                 <span className="text-[10px] text-gray-500">Opacity</span>
                 <input 
                   type="range" 
                   className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none accent-blue-500" 
                   value={selectedShape.opacity} 
                   onChange={e => onUpdateSelectedShape(s => ({ ...s, opacity: Number(e.target.value) }))} 
                   onClick={e => e.stopPropagation()} 
                 />
               </div>
            </div>
          )}

          {/* Stroke width is not used for images */}
          {selectedShape.type !== 'image' && (
            <div className="flex items-center justify-between gap-4 bg-white/5 p-2 rounded-2xl">
              <div className="flex-1 flex items-center gap-3 px-4">
                 <PenTool size={18} className="text-gray-500 shrink-0" />
                 <input 
                   type="range" 
                   min="1" 
                   max="20" 
                   step="1" 
                   className="w-full h-1.5 bg-white/10 rounded-lg appearance-none accent-blue-500" 
                   value={selectedShape.strokeWidth} 
                   onChange={e => onUpdateSelectedShape(s => ({ ...s, strokeWidth: Number(e.target.value) }))} 
                   onClick={e => e.stopPropagation()} 
                 />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleLock(selectedId); }} 
            className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 ${selectedShape.isLocked ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' : 'bg-white/5 text-gray-400'}`}
          >
            {selectedShape.isLocked ? <Lock size={18} /> : <Unlock size={18} />}
            <span className="text-sm">{selectedShape.isLocked ? 'Locked' : 'Unlocked'}</span>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDeleteShape(selectedId); }} 
            className="p-4 bg-red-500/10 text-red-500 rounded-2xl active:bg-red-500/20 transition-all border border-red-500/10"
          >
            <Trash2 size={22}/>
          </button>
        </div>
      </div>
    </div>
  );
});
