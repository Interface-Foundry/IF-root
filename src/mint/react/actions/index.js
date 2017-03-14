import * as types from '../constants/ActionTypes';
import fetch from 'isomorphic-fetch';

const receiveCart = (cart, newInfo) => ({
  type: types.RECEIVE_CART,
  newInfo
});

const requestCart = (cart) => ({
  type: types.REQUEST_CART,
  cart
});

const receiveCartItems = (cart, newInfo) => ({
  type: types.RECEIVE_CART_ITEMS,
  newInfo
});

const requestCartItems = (cart) => ({
  type: types.REQUEST_CART_ITEMS,
  cart
});

export function fetchCart(cart_id) {
  return function (dispatch) {
    // First dispatch: the app state is updated to inform
    // that the API call is starting.
    dispatch(requestCart(cart_id));
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
        dispatch(receiveCart(cart_id, json))
      );
    // In a real world app, you also want to
    // catch any error in the network call.
  };
}

export function fetchCartItems(cart_id) {
  return function (dispatch) {
    // First dispatch: the app state is updated to inform
    // that the API call is starting.
    dispatch(requestCartItems(cart_id));
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
        dispatch(receiveCartItems(cart_id, json))
      );
    // In a real world app, you also want to
    // catch any error in the network call.
  };
}

export function checkout(items){
  //who knows right now
}
