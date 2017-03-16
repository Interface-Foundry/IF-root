import { NEW_TYPE, RECIEVE_ITEM, REQUEST_ITEM } from '../constants/ActionTypes';

const initialState = {
  original_link: '',
  item_name: '',
  asin: '',
  cart: '',
  added: true,
  type: NEW_TYPE
};

export default function item(state = initialState, action) {
  switch (action.type) {
    case RECIEVE_ITEM:
      return Object.assign({}, state, action);
    case REQUEST_ITEM:
    default:
      return state;
  }
}
