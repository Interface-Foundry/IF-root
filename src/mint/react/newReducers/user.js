// react/reducers/session.js

import {
  RECEIVE_SESSION,
  RECEIVE_UPDATE_SESSION,
  UPDATE_USER,
  LOGOUT
} from '../constants/ActionTypes';

const initialState = {
  id: null,
  name: '',
  email_address: ''
};

export default (state = {}, action) => {
  switch (action.type) {
  case 'LOGOUT':
    return {};
  case 'SESSION_SUCCESS':
    return {
      ...state,
      ...action.response.user_account
    };
  default:
    return state;
  }
}
