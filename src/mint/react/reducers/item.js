import { RECEIVE_ITEM, CLEAR_ITEM } from '../constants/ActionTypes';

export default function item(state = {}, action) {
  switch (action.type) {
  case CLEAR_ITEM:
    return {};
  case RECEIVE_ITEM:
    return {
      ...state,
      ...action.item
    };
  default:
    return state;
  }
}