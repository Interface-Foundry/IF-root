// react/reducers/item.js

import {
  REQUEST_REMOVE_ITEM,
  RECEIVE_ITEM,
  CLEAR_ITEM,
  RECEIVE_INCREMENT_ITEM,
  RECEIVE_DECREMENT_ITEM,
  RECEIVE_SEARCH,
  SEARCH_NEXT,
  SEARCH_PREV,
  SET_SEARCH_INDEX,
  SELECT_DEAL,
} from '../constants/ActionTypes';

export default function item(state = {}, action) {
  let nextItemNum;
  switch (action.type) {
  case CLEAR_ITEM:
    return {};
  case RECEIVE_ITEM:
  case RECEIVE_INCREMENT_ITEM:
  case RECEIVE_DECREMENT_ITEM:
    return {
      ...state,
      ...action.item
    };
  case RECEIVE_SEARCH:
    nextItemNum = state.position ? state.position : 0;
    nextItemNum = action.index > action.items.length ? action.index % action.items.length : action.index < 0 ? -1 * (action.index % action.items.length) : nextItemNum; // try to keep it legal
    return {
      ...state,
      ...action.items[nextItemNum],
      position: nextItemNum,
      search: action.items
    };
  case SEARCH_NEXT:
    nextItemNum = state.position + 1 > state.search.length - 1 ? 0 : state.position + 1;
    return {
      ...state,
      ...state.search[nextItemNum],
      position: nextItemNum
    };
  case SEARCH_PREV:
    nextItemNum = state.position - 1 < 0 ? state.search.length - 1 : state.position - 1;
    return {
      ...state,
      ...state.search[nextItemNum],
      position: nextItemNum
    };
  case SET_SEARCH_INDEX:
    return {
      ...state,
      position: action.index
    };
  case SELECT_DEAL:
    return {
      ...action.deal
    };
  default:
    return state;
  }
}
