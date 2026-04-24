// App reducer for state management

export function appReducer(state, action) {
  switch (action.type) {
    case 'SET_STAGE':
      return {
        ...state,
        stage: typeof action.payload === 'function'
          ? action.payload(state.stage)
          : action.payload
      };
    case 'SET_SHAPES':
      return {
        ...state,
        shapes: typeof action.payload === 'function'
          ? action.payload(state.shapes)
          : action.payload
      };
    case 'SET_SELECTED_ID':
      return { ...state, selectedId: action.payload };
    case 'SET_ACTIVE_TOOL':
      return { ...state, activeTool: action.payload };
    case 'SET_SHOW_SETTINGS':
      return { ...state, showSettings: action.payload };
    case 'SET_SHOW_LAYERS':
      return { ...state, showLayers: action.payload };
    case 'SET_KEEP_ASPECT_RATIO':
      return { ...state, keepAspectRatio: action.payload };
    case 'SET_POLY_POINTS':
      return {
        ...state,
        polyPoints: typeof action.payload === 'function'
          ? action.payload(state.polyPoints)
          : action.payload
      };
    case 'SET_IS_INTERACTING':
      return { ...state, isInteracting: action.payload };
    default:
      return state;
  }
}
