import { NEW_TYPE, RECEIVE_ADD_ITEM_TO_CART, ADD_MEMBER_TO_CART, RECEIVE_CART, REQUEST_CART, RECEIVE_ITEMS, REQUEST_ITEMS } from '../constants/ActionTypes';
const initialState = {
  cart_id: '',
  magic_link: '',
  cart_leader: '',
  cart_members: [],
  items: [],
};

export default function cart(state = initialState, action) {
  switch (action.type) {
    case RECEIVE_ADD_ITEM_TO_CART:
      return Object.assign({}, state, {
        items: [...state.items, action.item]
      });
    case ADD_MEMBER_TO_CART:
      return Object.assign({}, state, {
        cart_members: [...state.cart_members, action]
      });
    case RECEIVE_CART:
      return Object.assign({}, state, action.newCart);
    case RECEIVE_ITEMS:
      return Object.assign({}, state, {
        items: action.items
      });
    case REQUEST_CART:
    case REQUEST_ITEMS:
    default:
      return state;
  }
}
