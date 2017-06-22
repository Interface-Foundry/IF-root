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
    };
  case 'SESSION_SUCCESS':
    return {
      ...state,
      popup: false
    };
  case 'LOGIN_SUCCESS':
    return {
      ...state,
      popup: !action.response.user_account
    };
  case 'TOGGLE_SIDENAV':
    return {
      ...state,
      sidenav: !state.sidenav
    };
  case 'TOGGLE_MODAL':
    return {
      ...state,
      modal: !state.modal,
      loginText: action.loginText,
      loginSubtext: action.loginSubtext
    };
  case '@@router/LOCATION_CHANGE':
    return {
      ...state,
      scrollTo: state.scrollTo ? 0 : 1
    };
  default:
    return state;
  }
}
