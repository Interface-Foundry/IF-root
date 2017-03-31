import { TOGGLE_ADDING, RECEIVE_SESSION, REQUEST_SESSION, REQUEST_UPDATE_SESSION, RECEIVE_UPDATE_SESSION } from '../constants/ActionTypes';
const initialState = {
  user_accounts: [],
  animal: '',
  createdAt: '',
  updatedAt: '',
  id: '',
  addingItem: false
};

export default function session(state = initialState, action) {
  switch (action.type) {
  case RECEIVE_SESSION:
    return {
      ...state,
      ...action.newSession
    };
  case RECEIVE_UPDATE_SESSION:
    const { user, ...newSession } = action.newSession;
    return {
      ...state,
      ...newSession,
      user_accounts: newSession.newAccount ? [...state.user_accounts, user] : state.user_accounts
    };
  case TOGGLE_ADDING:
    return {
      ...state,
      addingItem: !state.addingItem
    };
  case REQUEST_SESSION:
  case REQUEST_UPDATE_SESSION:
  default:
    return state;
  }
}
