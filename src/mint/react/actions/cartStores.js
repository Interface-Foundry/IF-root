// react/actions/cartStores.js

import { REQUEST_STORES, RECEIVE_STORES, REQUEST_SET_STORE, RECEIVE_SET_STORE } from '../constants/ActionTypes';

const request = () => ({
  type: REQUEST_STORES
});

const receive = (stores) => ({
  type: RECEIVE_STORES,
  stores
});

const requestSetStore = (storeType) => ({
  type: REQUEST_SET_STORE,
  storeType
});

const receiveSetStore = () => ({
  type: RECEIVE_SET_STORE
});

export function fetchStores() {
  return async function (dispatch) {
    dispatch(request());
    try {
      const response = await fetch('/api/test/store_list', {
        credentials: 'same-origin'
      });
      if (response.ok) {
        const json = await response.json();
        return dispatch(receive(json.stores));
      } else {
        return null;
      }
    } catch (e) {
      throw 'error in cart fetchCart';
    }
  };
}

export function setStore(cart_id, store) {
  return async dispatch => {
    dispatch(requestSetStore(store));
    try {
      await fetch(`/api/cart/${cart_id}`, {
        'method': 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        'body': JSON.stringify({store})
      });
      return dispatch(receiveSetStore());
    } catch (e) {
      throw e;
    }
  };
}
