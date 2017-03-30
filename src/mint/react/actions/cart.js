import { SET_CART_ID, RECEIVE_CART, REQUEST_CART, REQUEST_REMOVE_ITEM_FROM_CART, RECEIVE_REMOVE_ITEM_FROM_CART, REQUEST_ADD_ITEM_TO_CART, RECEIVE_ADD_ITEM_TO_CART, RECEIVE_ITEMS, REQUEST_ITEMS } from '../constants/ActionTypes';

const receive = (newCart) => ({
  type: RECEIVE_CART,
  newCart
});

const request = () => ({
  type: REQUEST_CART,
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

export function fetchCart(cart_id) {
  return async function (dispatch) {
    dispatch(request());

    (async() => {
      try {
        const response = await fetch(`/api/cart/${cart_id}`, {
          credentials: 'same-origin'
        });
        return dispatch(receive(await response.json()));
      } catch (e) {
        throw 'error in cart fetchCart'
      }
    })();
  };
}

export function fetchItems(cart_id) {
  return async dispatch => {
    dispatch(requestItems(cart_id));

    (async() => {
      try {
        const response = await fetch(`/api/cart/${cart_id}/items`, {
          credentials: 'same-origin'
        });
        return dispatch(receiveItems(await response.json()));
      } catch (e) {
        throw 'error in cart fetchItems'
      }
    })();
  };
}

export function removeItem(cart_id, item) {
  return async dispatch => {
    dispatch(requestRemoveItem());
    (async() => {
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
        throw 'error in cart removeItem'
      }
    })();
  };
}

export function addItem(cart_id, url) {
  return async dispatch => {
    dispatch(requestAddItem());

    (async() => {
      try {
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
        return dispatch(receiveAddItem(await response.json()));
      } catch (e) {
        throw 'error in cart addItem'
      }
    })();
  };
}
