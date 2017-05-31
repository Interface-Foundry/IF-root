// react/reducers/session.js

import {
  RECEIVE_SESSION,
  RECEIVE_UPDATE_SESSION,
  UPDATE_USER,
  LOGOUT
} from '../constants/ActionTypes';

export default (state = {}, action) => {
  switch (action.type) {
  case LOGOUT:
    return {};
  case RECEIVE_SESSION:
    return {
      ...state,
      ...action.newSession.user_account
    };
  case RECEIVE_UPDATE_SESSION:
    return {
      ...state,
      ...action.newSession.user_account,
    };
  case UPDATE_USER:
    return {
      ...state,
      ...action.user_account
    };
  default:
    return state;
  }
}
