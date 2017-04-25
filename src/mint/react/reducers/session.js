// react/reducers/session.js

import {
  RECEIVE_SESSION,
  REQUEST_SESSION,
  REQUEST_UPDATE_SESSION,
  RECEIVE_UPDATE_SESSION
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
  case REQUEST_SESSION:
  case REQUEST_UPDATE_SESSION:
  default:
    return state;
  }
}
