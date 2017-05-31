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
  case 'TOGGLE_POPUP':
    return {
      ...state,
      popup: !state.modal
    }
  case '@@router/LOCATION_CHANGE':
    return {
      ...state
    }
  default:
    return state;
  }
}
