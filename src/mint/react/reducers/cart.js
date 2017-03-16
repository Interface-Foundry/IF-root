import { NEW_TYPE, ADD_ITEM_TO_CART, ADD_MEMBER_TO_CART, RECIEVE_CART, REQUEST_CART } from '../constants/ActionTypes';
const initialState = {
  cart_id: '',
  magic_link: '',
  cart_leader: '',
  cart_members: [],
  items: [],
  type: NEW_TYPE
};

export default function cart(state = initialState, action) {
  switch (action.type) {
    case ADD_ITEM_TO_CART:
      return Object.assign({}, state, {
        items: [...state.items, action]
      });
    case ADD_MEMBER_TO_CART:
      return Object.assign({}, state, {
        cart_members: [...state.cart_members, action]
      });
    case RECIEVE_CART:
      return Object.assign({}, state, action);
    case REQUEST_CART:
    default:
      return state;
  }
}
