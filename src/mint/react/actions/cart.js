// react/actions/cart.js

import {
  ADDING_ITEM,
  RECEIVE_CART,
  RECEIVE_UPDATE_CART,
  REQUEST_CART,
  RECEIVE_ITEMS,
  REQUEST_ITEMS,
  RECEIVE_CARTS,
  REQUEST_CARTS,
  REQUEST_CLEAR_CART,
  CANCEL_CLEAR_CART,
  RECEIVE_CLEAR_CART
} from '../constants/ActionTypes';
import { sleep } from '../utils';

const receive = (currentCart) => ({
  type: RECEIVE_CART,
  currentCart
});

const request = () => ({
  type: REQUEST_CART
});

const recieveUpdate = updatedCart => ({
  type: RECEIVE_UPDATE_CART,
  updatedCart
});

const receiveCarts = (carts) => ({
  type: RECEIVE_CARTS,
  carts
});

const requestCarts = () => ({
  type: REQUEST_CARTS
});

const receiveItems = (items) => ({
  type: RECEIVE_ITEMS,
  items
});

const requestItems = () => ({
  type: REQUEST_ITEMS
});

const requestClearCart = () => ({
  type: REQUEST_CLEAR_CART
});

const cancelClearCart = () => ({
  type: CANCEL_CLEAR_CART
});

const receiveClearCart = () => ({
  type: RECEIVE_CLEAR_CART
});

export const addingItem = (addingItem) => ({
  type: ADDING_ITEM,
  addingItem
});

export const updateCartItem = newItem => ({});

export function fetchCart(cart_id) {
  return async function (dispatch) {
    dispatch(request());
    try {
      const response = await fetch(`/api/cart/${cart_id}`, {
        credentials: 'same-origin'
      });
      if (response.ok) {
        return dispatch(receive(await response.json()));
      } else {
        return null;
      }
    } catch (e) {
      throw 'error in cart fetchCart';
    }
  };
}

export function updateCart(cart) {
  return async dispatch => {
    try {
      const response = await fetch(`/api/cart/${cart.id}`, {
        'method': 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        'body': JSON.stringify(cart)
      });
      return dispatch(recieveUpdate(await response.json()));
    } catch (e) {
      throw e;
    }
  };
}

{ /* https://mint.kipthis.com/api/cart/:cart_id/clear */ }
export function clearCart(cart_id) {
  return async(dispatch, getState) => {
    dispatch(requestClearCart());
    try {
      await sleep(10000);
      if (getState()
        .currentCart.oldItems.length) {
        await fetch(`/api/cart/${cart_id}/clear`, {
          method: 'DELETE',
          credentials: 'same-origin',
        });
        dispatch(receiveClearCart(cart_id));
      }
    } catch (e) {
      throw 'error in cart removeItem';
    }
  };
}

export function deleteCart(cart_id) {
  return async dispatch => {
    try {
      await fetch(`/api/cart/${cart_id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
    } catch (e) {
      throw 'error in cart delete';
    }
  };
}

export function cancelClear() {
  return async(dispatch) => dispatch(cancelClearCart());
}

export function fetchAllCarts() {
  return async function (dispatch) {
    dispatch(requestCarts());

    try {
      const response = await fetch('/api/carts', {
        credentials: 'same-origin'
      });

      return dispatch(receiveCarts(await response.json()));
    } catch (e) {
      throw 'error in cart fetchCart';
    }
  };
}

export function fetchItems(cart_id) {
  return async dispatch => {
    dispatch(requestItems(cart_id));

    try {
      const response = await fetch(`/api/cart/${cart_id}/items`, {
        credentials: 'same-origin'
      });
      return dispatch(receiveItems(await response.json()));
    } catch (e) {
      throw 'error in cart fetchItems';
    }
  };
}

export function checkoutCart(cart_id) {
  return async dispatch => {
    dispatch(requestItems(cart_id));
    try {
      const response = await fetch(`/api/cart/${cart_id}/checkout`, {
        credentials: 'same-origin'
      });
      return dispatch(receiveItems(await response.json()));
    } catch (e) {
      throw 'error in cart fetchItems';
    }
  };
}

export function sendAddressData(user_id, full_name, line_1, line_2, city, region, code, country) {
  console.log(user_id);
  return async dispatch => {
    try {
      const response = await fetch(`/api/user/${user_id}`, {
        credentials: 'same-origin',
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        'body': JSON.stringify({ full_name, line_1, line_2, city, region, code, country })
      });
      return dispatch(receiveItems(await response.json()));
    } catch (e) {
      throw 'error in cart fetchItems';
    }
  };
}

export function updateItem(cartId, currentId, new_item_id, user_id) {
  return async dispatch => {
    try {
      const res = await fetch(`/cart/${cartId}/item/${currentId}/update`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        'body': JSON.stringify({ new_item_id, user_id })
      });
      dispatch(updateCartItem(await res.json()));
    } catch (e) {
      throw e;
    }
  };
}
