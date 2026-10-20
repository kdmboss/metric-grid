import { useReducer } from 'react';
import { HOME_VIEW } from '../MapCanvas.jsx';
const INITIAL_MAP = {
  layer: 'vulnerability',
  county: '',
  query: '',
  view: HOME_VIEW,
  protectedVisible: true,
  boundaryVisible: true,
  differenceVisible: true,
  mobilePlan: 'typical',
};
function reducer(state, action) {
  const value = typeof action.value === 'function' ? action.value(state[action.key]) : action.value;
  return {
    ...state,
    [action.key]: value,
  };
}
export function useMapUI() {
  const [map, dispatch] = useReducer(reducer, INITIAL_MAP);
  const setters = Object.fromEntries(
    Object.keys(INITIAL_MAP).map((key) => [
      `set${key[0].toUpperCase()}${key.slice(1)}`,
      (value) =>
        dispatch({
          key,
          value,
        }),
    ]),
  );
  return {
    ...map,
    ...setters,
  };
}
