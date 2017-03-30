import { LOGGED_IN, ONBOARD_NEW_USER, REGISTER_EMAIL, RECEIVE_SESSION, REQUEST_SESSION, REQUEST_UPDATE_SESSION, RECEIVE_UPDATE_SESSION } from '../constants/ActionTypes';
const initialState = {
  user_accounts: [],
  animal: '',
  createdAt: '',
  updatedAt: '',
  id: ''
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
      'user_accounts': newSession.newAccount ? [...state.user_accounts, user] : state.user_accounts
    };
  case ONBOARD_NEW_USER:
    return {
      ...state,
      onboarding: true,
    }
  case REGISTER_EMAIL:
    return {
      ...state,
      registered: true,
      onboarding: true
    }
  case LOGGED_IN:
    return {
      loggedIn: action.user_accounts.length > 0,
      ...state
    }
  case REQUEST_SESSION:
  case REQUEST_UPDATE_SESSION:
  default:
    return state;
  }
}
