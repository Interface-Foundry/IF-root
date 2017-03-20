import { RECEIVE_CART, REQUEST_CART, REQUEST_REMOVE_ITEM_FROM_CART, RECIEVE_REMOVE_ITEM_FROM_CART } from '../constants/ActionTypes';

const receive = (cart, newInfo) => ({
  type: RECEIVE_CART,
  ...newInfo
});

const request = (cart) => ({
  type: REQUEST_CART,
  ...cart
});

const receiveItems = (cart, newInfo) => ({
  type: RECEIVE_CART,
  ...newInfo
});

const requestItems = (cart) => ({
  type: REQUEST_CART,
  ...cart
});

const requestRemoveItem = (cart, item) => ({
  type: REQUEST_REMOVE_ITEM_FROM_CART,
  item,
  cart
});

const receiveRemoveItem = (cart) => ({
  type: RECIEVE_REMOVE_ITEM_FROM_CART,
  ...cart
});

export function fetchItems(cart_id) {
  return function (dispatch) {
    dispatch(request(cart_id));
    return fetch(`/api/cart/${cart_id}`, {
        credentials: 'same-origin'
      })
      .then(response =>
        response.json()
      )
      .then(json =>
        dispatch(receive(cart_id, json))
      );
  };
}

export function removeItem(cart_id, item) {
  return function (dispatch) {
    dispatch(requestRemoveItem(cart_id, item));
    return fetch(`/api/cart/${cart_id}/items`, {
        'method': 'DELETE',
        credentials: 'same-origin',
        'body': JSON.stringify({
          itemId: item,
          quantity: -1
        })
      }).then(response => response.json())
      .then(response =>
        dispatch(receiveRemoveItem(cart_id, response))
      );
  };
}
