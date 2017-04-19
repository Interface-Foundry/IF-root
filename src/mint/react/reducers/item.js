import { RECEIVE_ITEM, CLEAR_ITEM, RECEIVE_INCREMENT_ITEM, RECEIVE_DECREMENT_ITEM } from '../constants/ActionTypes';

export default function item(state = {}, action) {
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
  default:
    return state;
  }
}
