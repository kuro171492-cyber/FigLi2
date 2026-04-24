// TopBar component - main toolbar at the top of the screen

import React from 'react';
import { TOOLS, SHAPE_TYPES } from '../utils/constants.js';

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

const MousePointer2 = (props) => <Icon name="arrow_selector_tool" {...props} />;
const Hand = (props) => <Icon name="pan_tool_alt" {...props} />;
const FileImage = (props) => <Icon name="imagesmode" {...props} />;
const Settings2 = (props) => <Icon name="tune" {...props} />;
const X = (props) => <Icon name="close" {...props} />;
const Eye = (props) => <Icon name="visibility" {...props} />;
const EyeOff = (props) => <Icon name="visibility_off" {...props} />;
const Check = (props) => <Icon name="check" {...props} />;
const Layers = (props) => <Icon name="layers" {...props} />;

export const TopBar = React.memo(function TopBar({
  activeTool,
  shapes,
  polyPoints,
  showSettings,
  showLayers,
  selectedShape,
  onImageUpload,
  onSetTool,
  onToggleAllVisibility,
  onSetShowSettings,
  onSetShowLayers,
  onFinalizePoly
}) {
  const anyVisible = shapes.some(s => s.isVisible);

  return (
    <div className="h-14 border-b border-white/5 flex items-center justify-between px-3 shrink-0 bg-[#111] z-50">
      <div className="flex items-center gap-2">
        <label className="p-2 bg-blue-600 rounded-lg active:scale-90 transition-all cursor-pointer mr-2">
          <FileImage size={18} />
          <input type="file" className="hidden" onChange={onImageUpload} accept="image/*" />
        </label>
        <div className="flex bg-[#222] rounded-lg p-0.5 border border-white/10">
          <button 
            onClick={() => { onSetTool(TOOLS.SELECT); }} 
            className={`p-2 rounded-md transition-all ${activeTool === TOOLS.SELECT ? 'bg-white/10 text-white' : 'text-gray-500'}`}
          >
            <MousePointer2 size={18}/>
          </button>
          <button 
            onClick={() => { onSetTool(TOOLS.PAN); }} 
            className={`p-2 rounded-md transition-all ${activeTool === TOOLS.PAN ? 'bg-white/10 text-white' : 'text-gray-500'}`}
          >
            <Hand size={18}/>
          </button>
        </div>

        {shapes.length > 0 && (
          <button
            onClick={onToggleAllVisibility}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all active:scale-90 ${anyVisible ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-blue-500/20 border-blue-500/30 text-blue-400'}`}
            title={anyVisible ? "Hide all shapes" : "Show all shapes"}
          >
            {anyVisible ? <Eye size={18}/> : <EyeOff size={18}/>}
            <span className="text-[10px] font-bold uppercase hidden sm:block">
              {anyVisible ? 'Hide All' : 'Show All'}
            </span>
          </button>
        )}
        
        <button
          onClick={() => { onSetShowLayers(!showLayers); onSetShowSettings(false); }}
          className={`p-2 rounded-lg transition-all ${showLayers ? 'bg-blue-500 text-white' : 'bg-[#222] text-gray-400'}`}
          title="Layers"
        >
          <Layers size={20}/>
        </button>
      </div>

      {activeTool === TOOLS.POLY_DRAW && (
        <div className="flex items-center gap-2 bg-blue-600/20 px-3 py-1.5 rounded-full border border-blue-500/30">
          <span className="text-xs font-bold text-blue-400">Shape creation ({polyPoints.length})</span>
          {polyPoints.length >= 2 && (
            <button onClick={onFinalizePoly} className="bg-blue-500 text-white p-1 rounded-full active:scale-90 transition-all">
              <Check size={14} />
            </button>
          )}
          <button onClick={() => { onSetTool(TOOLS.SELECT); }} className="text-gray-400 p-1 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        {selectedShape && (
          <button 
            onClick={() => { onSetShowSettings(!showSettings); onSetShowLayers(false); }} 
            className={`p-2 rounded-lg transition-all ${showSettings ? 'bg-blue-500 text-white' : 'bg-[#222] text-gray-400'}`}
          >
            <Settings2 size={20}/>
          </button>
        )}
      </div>
    </div>
  );
});
