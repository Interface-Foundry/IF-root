import { RECEIVE_ITEM, REQUEST_ITEM, SELECT_ITEM } from '../constants/ActionTypes';

export default function item(state = {}, action) {
  switch (action.type) {
    case SELECT_ITEM:
      return {
        ...state,
        ...action.item
      };
    case RECEIVE_ITEM:
      return {
        ...state,
        ...action.item
      };
    case REQUEST_ITEM:
    default:
      return state;
  }
}
