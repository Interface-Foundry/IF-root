// react/reducers/item.js

import {
  RECEIVE_ITEM,
  CLEAR_ITEM,
  SELECT_ITEM,
  LOGOUT
} from '../constants/ActionTypes';

export default function item(state = {}, action) {
  let nextItemNum;
  switch (action.type) {
    case CLEAR_ITEM:
    case LOGOUT:
      return {};
    case RECEIVE_ITEM:
      return {
        ...state,
        ...action.item
      };
    case SELECT_ITEM:
      return {
        ...state,
        ...action.item
      };
    default:
      return state;
  }
}