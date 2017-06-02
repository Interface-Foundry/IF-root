// react/reducers/cartStores.js

import { RECEIVE_STORES, LOGOUT } from '../constants/ActionTypes';

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
  case 'LOGOUT':
    return initialState;
  case 'STORES_SUCCESS':
    return [
      ...action.response
    ];
  default:
    return state;
  }
}
