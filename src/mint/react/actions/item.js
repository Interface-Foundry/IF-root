import { REQUEST_ITEM, RECEIVE_ITEM, CLEAR_ITEM, REQUEST_ADD_ITEM, RECEIVE_ADD_ITEM, REQUEST_REMOVE_ITEM, RECEIVE_REMOVE_ITEM } from '../constants/ActionTypes';

const receive = (item) => ({
  type: RECEIVE_ITEM,
  item
});

const request = () => ({
  type: REQUEST_ITEM
});

const clear = () => ({
  type: CLEAR_ITEM
});

const requestAddItem = () => ({
  type: REQUEST_ADD_ITEM
});

const receiveAddItem = (item) => ({
  type: RECEIVE_ADD_ITEM,
  item
});

const requestRemoveItem = () => ({
  type: REQUEST_REMOVE_ITEM
});

const receiveRemoveItem = (item) => ({
  type: RECEIVE_REMOVE_ITEM,
  item
});

export function previewItem(item_id) {
  return async function (dispatch) {
    dispatch(request());

    try {
      const response = await fetch(`/api/itempreview?q=${item_id}`, {
        credentials: 'same-origin'
      });

      return dispatch(receive(await response.json()));
    } catch (e) {
      throw 'error in cart fetchItem';
    }
  };
}

export function addItem(cart_id, item_id) {
  return async dispatch => {
    dispatch(requestAddItem());
    try {
      const response = await fetch(`/api/cart/${cart_id}/item`, {
        'method': 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        'body': JSON.stringify({
          item_id
        })
      });
      return dispatch(receiveAddItem(await response.json()));
    } catch (e) {
      throw e;
    }
  };
}

export function removeItem(cart_id, item_id) {
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
          item_id
        })
      });
      return dispatch(receiveRemoveItem(await response.json()));
    } catch (e) {
      throw e;
    }
  };
}

export function clearItem() {
  return async function (dispatch) {
    return dispatch(clear());
  };
}
