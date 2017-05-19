const initialState = {
  loaded: false,
  loading: true,
  myCarts: [],
  otherCarts: []
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
  case 'SESSION_SUCCESS':
    return {
      ...state,
      ...action.response
    };
  case 'CARTS_SUCCESS':
    return {
      ...state,
      myCarts: action.response.filter((c, i) => c.leader.email_address === state.user_account.email_address),
      otherCarts: action.response.filter((c, i) => c.leader.email_address !== state.user_account.email_address)
    };
  case 'LOGOUT':
    return {
      ...initialState
    };
  default:
    return state;
  }
}
