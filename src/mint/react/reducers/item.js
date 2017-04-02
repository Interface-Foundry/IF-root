import { NEW_TYPE, RECEIVE_ITEM, REQUEST_ITEM } from '../constants/ActionTypes';

const initialState = {
  original_link: '',
  item_name: '',
  asin: '',
  cart: ''
};

export default function item(state = initialState, action) {
  switch (action.type) {
    case RECEIVE_ITEM:
      return {
        ...state,
        ...action
      };
    case REQUEST_ITEM:
    default:
      return state;
  }
}
