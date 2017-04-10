import { ADDING_ITEM, ADD_MEMBER_TO_CART, RECEIVE_CART, RECEIVE_CARTS, RECEIVE_ITEMS, RECEIVE_ADD_ITEM } from '../constants/ActionTypes';

const initialState = {
  carts: [],
  currentCart: {
    members: [],
    items: []
  },
  addingItem: false
};

export default function cart(state = initialState, action) {
  switch (action.type) {
  case ADDING_ITEM:
    return {
      ...state,
      addingItem: action.addingItem
    };
  case ADD_MEMBER_TO_CART:
    return {
      ...state,
      currentCart: {
        ...state.currentCart,
        members: [...state.currentCart.members, action.newMember]
      }
    };
  case RECEIVE_CART:
    return {
      ...state,
      currentCart: action.currentCart,
      cart_id: action.currentCart.id
    };
  case RECEIVE_ITEMS:
    return {
      ...state,
      currentCart: {
        ...state.currentCart,
        items: action.items
      }
    };
  case RECEIVE_ADD_ITEM:
    return {
      ...state,
      currentCart: {
        ...state.currentCart,
        items: [...state.currentCart.items, action.item]
      }
    };
  case RECEIVE_CARTS:
    return {
      ...state,
      carts: action.carts
    };
  default:
    return state;
  }
}

// Selector
export const getMemberById = (state, props) => [...state.members, state.leader].find(member => member.id === props.id);