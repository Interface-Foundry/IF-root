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
    return Object.assign({}, state, action, {
      'user_accounts': action.newAccount ? [...state.user_accounts, action.user] : state.user_accounts,
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
