// react/reducers/cartStores.js

import { RECEIVE_STORES } from '../constants/ActionTypes';

const initialState = {
  stores: []
};

export default function cartStores(state = initialState, action) {
  switch (action.type) {
  case RECEIVE_STORES:
    return {
      stores: action.stores
    };
  default:
    return state;
  }
}
