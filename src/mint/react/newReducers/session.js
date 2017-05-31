// react/reducers/session.js

import {
  RECEIVE_SESSION,
  RECEIVE_UPDATE_SESSION,
  UPDATE_USER,
  LOGOUT
} from '../constants/ActionTypes';

export default function session(state = {}, action) {
  switch (action.type) {
  case LOGOUT:
    return {};
  case RECEIVE_SESSION:
    return {
      ...state,
      ...action.newSession
    };
  case RECEIVE_UPDATE_SESSION:
    return {
      ...state,
      ...action.newSession,
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
