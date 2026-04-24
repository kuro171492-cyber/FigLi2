// Constants for the application

export const SHAPE_TYPES = {
  RECT: 'rect',
  CIRCLE: 'circle',
  TRIANGLE: 'triangle',
  LINE: 'line',
  POLY: 'poly',
  IMAGE: 'image'
};

export const TOOLS = {
  PAN: 'pan',
  SELECT: 'select',
  POLY_DRAW: 'poly_draw'
};

export const COLOR_PRESETS = [
  '#2563eb', '#7c3aed', '#db2777', '#ea580c',
  '#ca8a04', '#16a34a', '#0d9488', '#0891b2',
  '#475569', '#f8fafc'
];

export const QUICK_MENU_START_ANGLE = 180;
export const QUICK_MENU_END_ANGLE = 360;
export const QUICK_MENU_SWEEP = QUICK_MENU_END_ANGLE - QUICK_MENU_START_ANGLE;
