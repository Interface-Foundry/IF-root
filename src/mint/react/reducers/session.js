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
    console.log('Inside return of /api/indentify', action.newSession)
    return {
      ...state,
      ...action.newSession
    };
  case RECEIVE_UPDATE_SESSION:
    console.log('Inside return of /api/session', action.newSession)
    return {
      ...state,
      ...action.newSession,
      user_account: action.newSession.user
    };
  case REQUEST_SESSION:
  case REQUEST_UPDATE_SESSION:
  default:
    return state;
  }
}
