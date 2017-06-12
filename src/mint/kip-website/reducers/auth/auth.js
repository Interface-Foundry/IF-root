const initialState = {
  loaded: false,
  loading: true,
  posts: [],
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
    }
  case 'POSTS_SUCCESS':
    return {
      ...state,
      posts: action.response.filter((p, i) => !!p.imageSrc)
    }
  case 'LOGOUT':
    return {
      ...initialState
    };
  default:
    return state;
  }
}
