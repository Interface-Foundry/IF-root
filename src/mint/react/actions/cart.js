import { ADDING_ITEM, RECEIVE_CART, REQUEST_CART, REQUEST_REMOVE_ITEM_FROM_CART, RECEIVE_REMOVE_ITEM_FROM_CART, RECEIVE_ITEMS, REQUEST_ITEMS, RECEIVE_CARTS, REQUEST_CARTS } from '../constants/ActionTypes';

const receive = (currentCart) => ({
  type: RECEIVE_CART,
  currentCart
});

const request = () => ({
  type: REQUEST_CART
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

const requestRemoveItem = () => ({
  type: REQUEST_REMOVE_ITEM_FROM_CART
});

const receiveRemoveItem = (currentCart) => ({
  type: RECEIVE_REMOVE_ITEM_FROM_CART,
  ...currentCart
});

export const addingItem = (addingItem) => ({
  type: ADDING_ITEM,
  addingItem
});

export function fetchCart(cart_id) {
  return async function (dispatch) {
    dispatch(request());

    try {
      const response = await fetch(`/api/cart/${cart_id}`, {
        credentials: 'same-origin'
      });

      return dispatch(receive(await response.json()));
    } catch (e) {
      throw 'error in cart fetchCart';
    }
  };
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

export function removeItem(cart_id, item) {
  return async dispatch => {
    dispatch(requestRemoveItem());

    try {
      const response = await fetch(`/api/cart/${cart_id}/item`, {
        'method': 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        'body': JSON.stringify({
          item_id: item
        })
      });
      return dispatch(receiveRemoveItem(await response.json()));
    } catch (e) {
      throw 'error in cart removeItem';
    }
  };
}
