const initialState = {
  loaded: false,
  loading: true,
  carts: [],
  archivedCarts: []
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
  case 'LOGIN_SUCCESS':
  case 'SESSION_SUCCESS':
    return {
      ...state,
      ...action.response
    };
  case 'CARTS_SUCCESS':
    return {
      ...state,
      carts: action.response.filter(c => !c.locked),
      archivedCarts: action.response.filter(c => c.locked)
    };
  case 'LOGOUT':
    return {
      ...initialState
    };
  default:
    return state;
  }
}
