// react/actions/item.js

import {
  REQUEST_ITEM,
  RECEIVE_ITEM,
  RECEIVE_SEARCH,
  CLEAR_ITEM,
  REQUEST_ADD_ITEM,
  RECEIVE_ADD_ITEM,
  REQUEST_REMOVE_ITEM,
  RECEIVE_REMOVE_ITEM,
  CANCEL_REMOVE_ITEM,
  RECEIVE_INCREMENT_ITEM,
  REQUEST_INCREMENT_ITEM,
  RECEIVE_DECREMENT_ITEM,
  REQUEST_DECREMENT_ITEM,
  SEARCH_PREV,
  SEARCH_NEXT,
  SET_SEARCH_INDEX,
  REQUEST_CHANGE_ITEM_TYPE,
  RECEIVE_CHANGE_ITEM_TYPE,
} from '../constants/ActionTypes';

import { sleep } from '../utils';

const receiveItem = (item) => ({
  type: RECEIVE_ITEM,
  item
});

const receiveSearch = (items) => ({
  type: RECEIVE_SEARCH,
  items
});

const searchNext = () => ({
  type: SEARCH_NEXT
});

const searchPrev = () => ({
  type: SEARCH_PREV
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

const requestRemoveItem = (itemToRemove) => ({
  type: REQUEST_REMOVE_ITEM,
  itemToRemove
});

const receiveRemoveItem = () => ({
  type: RECEIVE_REMOVE_ITEM
});

const cancelDeleteItem = () => ({
  type: CANCEL_REMOVE_ITEM
});

const receiveIncrementItem = (item) => ({
  type: RECEIVE_INCREMENT_ITEM,
  item
});

const requestIncrementItem = (item) => ({
  type: REQUEST_INCREMENT_ITEM,
  item
});

const receiveDecrementItem = (item) => ({
  type: RECEIVE_DECREMENT_ITEM,
  item
});

const requestDecrementItem = (item) => ({
  type: REQUEST_DECREMENT_ITEM,
  item
});

const setSearch = (index) => ({
  type: SET_SEARCH_INDEX,
  index
});

const requestChangeType = () => ({
  type: REQUEST_CHANGE_ITEM_TYPE
});

const receiveChangeType = (asin) => ({
  type: RECEIVE_CHANGE_ITEM_TYPE,
  asin
});

export function previewItem(item_id) {
  return async function (dispatch) {
    dispatch(request());

    try {
      const response = await fetch(`/api/item/${item_id}`, {
        credentials: 'same-origin'
      });
      const json = await response.json();
      return Array.isArray(json) ? dispatch(receiveSearch(json)) : dispatch(receiveItem(json));
    } catch (e) {
      throw 'error in cart previewItem';
    }
  };
}

export function previewAmazonItem(amazon_id) {
  return async function (dispatch) {
    dispatch(request());
    try {
      const response = await fetch(`/api/itempreview?q=${amazon_id}`, {
        credentials: 'same-origin'
      });
      const json = await response.json();
      return Array.isArray(json) ? dispatch(receiveSearch(json)) : dispatch(receiveItem(json));
    } catch (e) {
      throw 'error in cart previewAmazonItem';
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
  return async(dispatch, getState) => {
    dispatch(requestRemoveItem(item_id));
    try {
      await sleep(10000);
      if (getState()
        .currentCart.itemDeleted) {
        await fetch(`/api/cart/${cart_id}/item/${item_id}`, {
          method: 'DELETE',
          credentials: 'same-origin',
        });
      }
    } catch (e) {
      throw 'error in cart removeItem';
    }
  };
}

export function cancelRemoveItem() {
  return async(dispatch) => dispatch(cancelDeleteItem());
}

export function incrementItem(item_id, quantity) {
  quantity++;
  return async dispatch => {
    dispatch(requestIncrementItem());
    try {
      const response = await fetch(`/api/item/${item_id}`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantity
        })
      });
      return dispatch(receiveIncrementItem(await response.json()));
    } catch (e) {
      throw 'error in cart incrementItem';
    }
  };
}

export function decrementItem(item_id, quantity) {
  quantity--;
  return async dispatch => {
    dispatch(requestDecrementItem());
    try {
      const response = await fetch(`/api/item/${item_id}`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantity
        })
      });
      return dispatch(receiveDecrementItem(await response.json()));
    } catch (e) {
      throw 'error in cart decrementItem';
    }
  };
}

export function changeItemType(item_id, newAsin) {
  return async(dispatch, getState) => {
    dispatch(requestRemoveItem());
    try {
      await fetch(`/api/item/${item_id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      return dispatch(receiveRemoveItem(item_id));
    } catch (e) {
      throw 'error in cart removeItem';
    }
  };
}

export function clearItem() {
  return async dispatch => dispatch(clear());
}

export function nextSearch() {
  return async dispatch => dispatch(searchNext());
}

export function prevSearch() {
  return async dispatch => dispatch(searchPrev());
}

export function setSearchIndex(index) {
  return async dispatch => dispatch(setSearch(index));
}
