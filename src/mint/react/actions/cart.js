import { RECEIVE_CART, REQUEST_CART, REQUEST_REMOVE_ITEM_FROM_CART, RECIEVE_REMOVE_ITEM_FROM_CART } from '../constants/ActionTypes';
import fetch from 'isomorphic-fetch';

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

export function update(cart_id) {
  return function (dispatch) {
    // First dispatch: the app state is updated to inform
    // that the API call is starting.
    dispatch(request(cart_id));
    // The function called by the thunk middleware can return a value,
    // that is passed on as the return value of the dispatch method.
    // In this case, we return a promise to wait for.
    // This is not required by thunk middleware, but it is convenient for us.
    return fetch(`/api/cart/${cart_id}`)
      .then(response =>
        response.json()
      )
      .then(json =>
        // We can dispatch many times!
        // Here, we update the app state with the results of the API call.
        dispatch(receive(cart_id, json))
      );
    // In a real world app, you also want to
    // catch any error in the network call.
  };
}

export function updateItems(cart_id) {
  return function (dispatch) {
    // First dispatch: the app state is updated to inform
    // that the API call is starting.
    dispatch(requestItems(cart_id));
    // The function called by the thunk middleware can return a value,
    // that is passed on as the return value of the dispatch method.
    // In this case, we return a promise to wait for.
    // This is not required by thunk middleware, but it is convenient for us.
    return fetch(`/api/cart/${cart_id}/items`)
      .then(response =>
        response.json()
      )
      .then(json =>
        // We can dispatch many times!
        // Here, we update the app state with the results of the API call.
        dispatch(receiveItems(cart_id, json))
      );
    // In a real world app, you also want to
    // catch any error in the network call.
  };
}

export function removeItem(cart_id, item) {
  return function (dispatch) {
    dispatch(requestRemoveItem(cart_id, item));
    return fetch(`/api/cart/${cart_id}/items`, {
      'method': 'DELETE',
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
