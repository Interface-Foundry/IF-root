// react/reducers/cartStores.js

import { RECEIVE_STORES, LOGOUT } from '../constants/ActionTypes';

const initialState = {
  stores: []
};

export default (state = initialState, action) => {
  switch (action.type) {
  case LOGOUT:
    return initialState;
  case RECEIVE_STORES:
    return {
      stores: action.stores
    };
  default:
    return state;
  }
}
