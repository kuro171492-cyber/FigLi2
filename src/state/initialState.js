// Initial state for the app reducer

import { TOOLS } from '../utils/constants.js';

export const initialAppState = {
  stage: { x: 20, y: 80, scale: 0.5 },
  shapes: [],
  selectedId: null,
  activeTool: TOOLS.SELECT,
  showSettings: false,
  showLayers: false,
  keepAspectRatio: true,
  polyPoints: [],
  isInteracting: false
};
