import { RECEIVE_ADD_ITEM_TO_CART, ADDING_ITEM, ADD_MEMBER_TO_CART, RECEIVE_CART, REQUEST_CART, RECEIVE_ITEMS, REQUEST_ITEMS } from '../constants/ActionTypes';

const initialState = {
  cart_id: '',
  magic_link: '',
  members: [],
  leader: null,
  addingItem: false,
  items: []
};

export default function cart(state = initialState, action) {
  switch (action.type) {
    case ADDING_ITEM:
      return {
        ...state,
        addingItem: action.addingItem
      };
    case RECEIVE_ADD_ITEM_TO_CART:
      return {
        ...state,
        items: [...state.items, action.item]
      };
    case ADD_MEMBER_TO_CART:
      return {
        ...state,
        members: [...state.members, action.newMember]
      };
    case RECEIVE_CART:
      return {
        ...state,
        ...action.newCart,
        cart_id: action.newCart.id
      };
    case RECEIVE_ITEMS:
      return {
        ...state,
        items: action.items
      };
    case REQUEST_CART:
    case REQUEST_ITEMS:
    default:
      return state;
  }
}

// Selector
export const getMemberById = (state, props) => [...state.members, state.leader].find(member => member.id === props.id)
