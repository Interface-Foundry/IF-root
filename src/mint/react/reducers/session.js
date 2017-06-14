import {
  RECEIVE_UPDATE_SESSION,
  UPDATE_USER,
  LOGOUT
} from '../constants/ActionTypes';

const initialState = {
  user_account: {},
  animal: '',
  createdAt: '',
  updatedAt: '',
  id: ''
};

export default function session(state = initialState, action) {
  switch (action.type) {
  case LOGOUT:
    return initialState;
  case 'SESSION_SUCCESS':
    return {
      ...state,
      ...action.response
    };
  case RECEIVE_UPDATE_SESSION:
    return {
      ...state,
      ...action.newSession
      // user_account: action.newSession.user || action.newSession.user_account
    };
  case UPDATE_USER:
    return {
      ...state,
      user_account: action.user_account
    };
  default:
    return state;
  }
}
