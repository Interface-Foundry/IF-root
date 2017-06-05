const initialState = {
  sidenav: false,
  popup: false
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
  case 'TOGGLE_SIDENAV':
    return {
      ...state,
      sidenav: !state.sidenav
    }
  case 'CODE_SUCCESS':
    return {
      ...state,
      popup: false
    }
  case 'TOGGLE_POPUP':
    return {
      ...state,
      popup: !state.popup
    }
  case '@@router/LOCATION_CHANGE':
    return {
      ...state
    }
  default:
    return state;
  }
}
