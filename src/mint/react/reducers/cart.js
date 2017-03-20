import { NEW_TYPE, RECEIVE_ADD_ITEM_TO_CART, ADD_MEMBER_TO_CART, RECEIVE_CART, REQUEST_CART } from '../constants/ActionTypes';
const initialState = {
  cart_id: '',
  magic_link: '',
  cart_leader: '',
  cart_members: [],
  items: [],
  type: NEW_TYPE
};

export default function cart(state = initialState, action) {
  console.log('state', state, 'action', action);
  switch (action.type) {
    case RECEIVE_ADD_ITEM_TO_CART:
      console.log('returning ', Object.assign({}, state, {
        items: [...state.items, action]
      }));
      return Object.assign({}, state, {
        items: [...state.items, action]
      });
    case ADD_MEMBER_TO_CART:
      return Object.assign({}, state, {
        cart_members: [...state.cart_members, action]
      });
    case RECEIVE_CART:
      return Object.assign({}, state, action);
    case REQUEST_CART:
    default:
      return state;
  }
}
