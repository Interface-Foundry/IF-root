import {
  ADDING_ITEM,
  ADD_MEMBER_TO_CART,
  RECEIVE_CART,
  RECEIVE_ITEMS,
  RECEIVE_ADD_ITEM,
  RECEIVE_REMOVE_ITEM,
  RECEIVE_INCREMENT_ITEM,
  RECEIVE_DECREMENT_ITEM
} from '../constants/ActionTypes';

const initialState = {
  members: [],
  items: [],
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
      members: [...state.members, action.newMember]
    };
  case RECEIVE_CART:
    return {
      ...state,
      ...action.currentCart,
      cart_id: action.currentCart.id
    };
  case RECEIVE_ITEMS:
    return {
      ...state,
      items: action.items
    };
  case RECEIVE_ADD_ITEM:
    return {
      ...state,
      items: [...state.items, action.item]
    };
  case RECEIVE_REMOVE_ITEM:
    return {
      ...state,
      items: state.items.filter(item => item.id !== action.itemToRemove)
    };
  case RECEIVE_INCREMENT_ITEM:
  case RECEIVE_DECREMENT_ITEM:
    return {
      ...state,
      items: state.items.map(item => item.id === action.item.id ? action.item : item) //replace item that matches with new one
    };
  default:
    return state;
  }
}

// Selector
export const getMemberById = (state, props) => [...state.members, state.leader].find(member => member.id === props.id);

export const splitCartById = (state, props) => {
  const id = props ? props.id : null

  return _.reduce(state.currentCart.items, (acc, item) => {
    acc.quantity = acc.quantity + 1

    if (id === item.added_by) {
      acc['my'].push(item)
    } else {
      acc['others'].push(item)
    }

    return acc
  }, {
    my: [],
    others: [],
    quantity: 0
  })
}
