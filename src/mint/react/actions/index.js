import * as types from '../constants/ActionTypes';
import userReducer from '../reducers/user';
import fetch from 'isomorphic-fetch';

const baseUrl = 'http://127.0.0.1:3000';

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

const receiveUser = (user, newInfo) => ({
  type: types.RECEIVE_USER,
  newInfo
});

const requestUser = (user) => ({
  type: types.REQUEST_USER,
  user
});

const requestRemoveCartItem = (cart, item) => ({
  type: types.REMOVE_FROM_CART,
  item,
  cart
});

const receiveRemoveCartItem = (cart) => ({
  type: types.REMOVE_FROM_CART,
  cart
});

export function fetchUser(user_id) {
  return function (dispatch) {
    dispatch(requestUser(user_id));
    return fetch(`/api/user/${user_id}`)
      .then(response => response.json())
      .then(json => dispatch(receiveUser(user_id, json)));
  };
}

export function createUser() {
  let newUser = userReducer();
  newUser.email = `${Math.random() * 1e7 | 0}@kipthis.com`;
  console.log(newUser);
  return newUser;
}

export function fetchCart(cart_id) {
  return function (dispatch) {
    // First dispatch: the app state is updated to inform
    // that the API call is starting.
    dispatch(requestCart(cart_id));
    // The function called by the thunk middleware can return a value,
    // that is passed on as the return value of the dispatch method.
    // In this case, we return a promise to wait for.
    // This is not required by thunk middleware, but it is convenient for us.
    return fetch(`${baseUrl}/api/cart/${cart_id}`)
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
    return fetch(`${baseUrl}/api/cart/${cart_id}/items`)
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

export function removeCartItem(cart_id, item) {
  return function (dispatch) {
    dispatch(requestRemoveCartItem(cart_id, item));
    return fetch(`${baseUrl}/api/cart/${cart_id}/items`, {
        'method': 'DELETE',
        'body': JSON.stringify({
          itemId: item,
          quantity: -1
        })
      })
      .then(response =>
        dispatch(receiveCart(cart_id))
      );
  };
}

export function signUp(e, state) {
  const { cart_id, email } = state;
  console.log(cart_id, email);
  e.preventDefault();
  return function (dispatch) {
    // dispatch(requestCreateEmail(cart_id, item));
    return fetch(`${baseUrl}/createaccount?cart_id=${cart_id}&email=${email}`)
      .then(response =>
        console.log(response)
      );
  };
}
