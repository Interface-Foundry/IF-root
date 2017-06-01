const initialState = {
  fixed: false,
  sidenav: false,
  modal: false,
  animationOffset: 0,
  containerHeight: 0,
  animationState: -2,
  scrollTo: 0
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
  case 'SCROLL_TO':
  case 'REGISTER_HEIGHT':
  case 'HANDLE_SCROLL':
    return {
      ...state,
      ...action.response
    }
  case 'TOGGLE_SIDENAV':
    return {
      ...state,
      sidenav: !state.sidenav
    }
  case 'TOGGLE_MODAL':
    return {
      ...state,
      modal: !state.modal,
      loginText: action.loginText,
      loginSubtext: action.loginSubtext
    }
  case '@@router/LOCATION_CHANGE':
    return {
      ...state,
      scrollTo: 0
    }
  default:
    return state;
  }
}
