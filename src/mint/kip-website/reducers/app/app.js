const initialState = {
  fixed: false,
  sidenav: false,
  modal: false,
  animationOffset: 0,
  containerHeight: 0,
  animationState: -2
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
  case 'REGISTER_HEIGHT':
  case 'HANDLE_SCROLL':
    console.log(action.response)
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
      modal: !state.modal
    }
  default:
    return state;
  }
}
