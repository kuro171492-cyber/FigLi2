// Main App component - entry point for the FigmaLite application

import React, { useReducer, useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { SHAPE_TYPES, TOOLS, COLOR_PRESETS, QUICK_MENU_START_ANGLE, QUICK_MENU_END_ANGLE, QUICK_MENU_SWEEP } from './utils/constants.js';
import { clamp, generateId } from './utils/geometry.js';
import { initialAppState } from './state/initialState.js';
import { appReducer } from './state/appReducer.js';
import { useStageGestures } from './hooks/useStageGestures.js';
import { useShapeTransform } from './hooks/useShapeTransform.js';
import { TopBar } from './components/TopBar.jsx';
import { ShapeItem } from './components/ShapeItem.jsx';
import { LayersPanel } from './components/LayersPanel.jsx';
import { SettingsPanel } from './components/SettingsPanel.jsx';
import { QuickImageMenu } from './components/QuickImageMenu.jsx';

const Icon = ({ name, size = 16, className = "", style = {}, ...rest }) => (
  <span className={`material-symbols-outlined ${className}`.trim()} style={{ fontSize: size, lineHeight: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", verticalAlign: "middle", userSelect: "none", ...style }} {...rest}>{name}</span>
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
const Square = (props) => <Icon name="crop_square" {...props} />;
const Circle = (props) => <Icon name="circle" {...props} />;
const Triangle = (props) => <Icon name="change_history" {...props} />;
const Minus = (props) => <Icon name="remove" {...props} />;
const Pentagon = (props) => <Icon name="pentagon" {...props} />;

export default function App() {
