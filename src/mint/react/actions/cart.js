import { RECEIVE_CART, REQUEST_CART, REQUEST_REMOVE_ITEM_FROM_CART, RECEIVE_REMOVE_ITEM_FROM_CART, REQUEST_ADD_ITEM_TO_CART, RECEIVE_ADD_ITEM_TO_CART, RECEIVE_ITEMS, REQUEST_ITEMS } from '../constants/ActionTypes';

const receive = (newInfo) => ({
  type: RECEIVE_CART,
  ...newInfo
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

const requestAddItem = (cart, item) => ({
  type: REQUEST_ADD_ITEM_TO_CART,
  item,
  cart
});

const receiveAddItem = (item) => ({
  type: RECEIVE_ADD_ITEM_TO_CART,
  item
});

export function update(cart_id) {
  return async function (dispatch) {
    dispatch(request(cart_id));
    const response = await fetch(`/api/cart/${cart_id}`, {
      credentials: 'same-origin'
    });
    dispatch(receive(await response.json()));
  };
}

export function fetchItems(cart_id) {
  return async dispatch => {
    dispatch(requestItems(cart_id));
    const response = await fetch(`/api/cart/${cart_id}/items`, {
      credentials: 'same-origin'
    });
    if (response.ok) dispatch(receiveItems(await response.json()));
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
    if (response.ok) dispatch(receiveRemoveItem(await response.json()));
  };
}

export function addItem(e, cart_id, url) {
  e.preventDefault();
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
    var res = await response.json();
    console.log(res)
    if (response.ok) dispatch(receiveAddItem(res));
  };
}
