// react/reducers/loading.js

const initialState = {
  loadingState: {},
  loading: false
};

export default (state = initialState, action) => {
  const loadingState = { ...state.loadingState };
  if (action.type.includes('_LOADING')) loadingState[action.type.replace('_LOADING', '')] = true;
  else if (action.type.includes('_SUCCESS')) delete loadingState[action.type.replace('_SUCCESS', '')];
  return {
    loadingState,
    loading: Object.values(loadingState).reduce((a, i) => a || i, false)
  };
}