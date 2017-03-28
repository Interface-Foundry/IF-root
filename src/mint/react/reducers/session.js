import { LOGGED_IN, RECEIVE_SESSION, REQUEST_SESSION, REQUEST_UPDATE_SESSION, RECEIVE_UPDATE_SESSION } from '../constants/ActionTypes';
const initialState = {
  onborded: false,
  user_accounts: [],
  animal: '',
  createdAt: '',
  updatedAt: '',
  id: ''
};

export default function session(state = initialState, action) {
  switch (action.type) {
  case RECEIVE_SESSION:
    return Object.assign({}, state, action);
  case RECEIVE_UPDATE_SESSION:
    const newAccount = action.ok && action.status !== "USER_LOGGED_IN";
    console.log('newAccount', newAccount)
    console.log('returning', Object.assign({}, state, {
      newAccount: newAccount,
      user_accounts: newAccount ? [...state.user_accounts, action.user] : state.user_accounts,
      ...action
    }))
    return Object.assign({}, state, {
      newAccount: newAccount,
      user_accounts: newAccount ? [...state.user_accounts, action.user] : state.user_accounts,
      ...action
    });
  case LOGGED_IN:
    return {
      ...state,
      onborded: true
    }
  case REQUEST_SESSION:
  case REQUEST_UPDATE_SESSION:
  default:
    return state;
  }
}
