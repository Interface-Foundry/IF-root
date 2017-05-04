// react/reducers/session.js

import {
  RECEIVE_SESSION,
  RECEIVE_UPDATE_SESSION,
  UPDATE_USER
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
  case RECEIVE_SESSION:
    return {
      ...state,
      ...action.newSession
    };
  case RECEIVE_UPDATE_SESSION:
    return {
      ...state,
      ...action.newSession,
      user_account: action.newSession.user || action.newSession.user_account
    };
  case UPDATE_USER:
    return {
      ...state,
      user_account: action.userInfo
    };
  default:
    return state;
  }
}
