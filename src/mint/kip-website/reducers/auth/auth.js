const initialState = {
  loaded: false,
  loading: true,
  myCarts: [],
  otherCarts: [],
  posts: []
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
  case 'SESSION_SUCCESS':
    return {
      ...state,
      ...action.response
    }
  case 'CARTS_SUCCESS':
    return {
      ...state,
      myCarts: action.response.filter((c, i) => c.leader.email_address === state.user_account.email_address),
      otherCarts: action.response.filter((c, i) => c.leader.email_address !== state.user_account.email_address)
    }
  case 'POSTS_SUCCESS':
    return {
      ...state,
      posts: action.response.filter((p, i) => !!p.imageSrc)
    }
  default:
    return state;
  }
}
