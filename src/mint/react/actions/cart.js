import { SET_CART_ID, RECEIVE_CART, REQUEST_CART, REQUEST_REMOVE_ITEM_FROM_CART, RECEIVE_REMOVE_ITEM_FROM_CART, REQUEST_ADD_ITEM_TO_CART, RECEIVE_ADD_ITEM_TO_CART, RECEIVE_ITEMS, REQUEST_ITEMS } from '../constants/ActionTypes';

const receive = (newCart) => ({
  type: RECEIVE_CART,
  newCart
});

const request = (cart) => ({
  type: REQUEST_CART,
  ...cart
});

const receiveItems = (items) => ({
  type: RECEIVE_ITEMS,
  items
});

const requestItems = () => ({
  type: REQUEST_ITEMS
});

const requestRemoveItem = (cart, item) => ({
  type: REQUEST_REMOVE_ITEM_FROM_CART,
  item,
  cart
});

const receiveRemoveItem = (cart) => ({
  type: RECEIVE_REMOVE_ITEM_FROM_CART,
  ...cart
});

const requestAddItem = () => ({
  type: REQUEST_ADD_ITEM_TO_CART
});

const receiveAddItem = (item) => ({
  type: RECEIVE_ADD_ITEM_TO_CART,
  item
});

export const setCartId = (cartId) => ({
  type: SET_CART_ID,
  cartId
})

export function update(cart_id) {
  return async function (dispatch) {
    dispatch(request(cart_id));
    const response = await fetch(`/api/cart/${cart_id}`, {
      credentials: 'same-origin'
    });
    return dispatch(receive(await response.json()));
  };
}

export function fetchItems(cart_id) {
  return async dispatch => {
    dispatch(requestItems(cart_id));
    const response = await fetch(`/api/cart/${cart_id}/items`, {
      credentials: 'same-origin'
    });
    if (response.ok) return dispatch(receiveItems(await response.json()));
  };
}

export function removeItem(cart_id, item) {
  return async dispatch => {
    dispatch(requestRemoveItem(cart_id, item));
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
    if (response.ok) return dispatch(receiveRemoveItem(await response.json()));
  };
}

export function addItem(cart_id, url) {
  return async dispatch => {
    dispatch(requestAddItem());
    const response = await fetch(`/api/cart/${cart_id}/item`, {
      'method': 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      'body': JSON.stringify({
        url: url
      })
    });
    if (response.ok) return dispatch(receiveAddItem(await response.json()));
  };
}
