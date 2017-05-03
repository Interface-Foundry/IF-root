// react/reducers/currentCart.js

import {
  ADDING_ITEM,
  ADD_MEMBER_TO_CART,
  RECEIVE_CART,
  RECEIVE_UPDATE_CART,
  RECEIVE_ITEMS,
  RECEIVE_ADD_ITEM,
  REQUEST_REMOVE_ITEM,
  CANCEL_REMOVE_ITEM,
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
      addingItem: action.addingItem,

    };
  case ADD_MEMBER_TO_CART:
    return {
      ...state,
      members: [...state.members, action.newMember]
    };
  case RECEIVE_UPDATE_CART:
    if (action.updatedCart.id !== state.cart_id) return state;
    return {
      ...state,
      locked: action.updatedCart.locked,
      thumbnail_url: action.updatedCart.thumbnail_url,
      name: action.updatedCart.name,
      cart_id: action.updatedCart.id
    };
  case RECEIVE_CART:
    return {
      ...state,
      ...action.currentCart,
      locked: action.currentCart.locked || false,
      cart_id: action.currentCart.id
    };
  case RECEIVE_ITEMS:
    return {
      ...state,
      items: action.items.reverse()
    };
  case RECEIVE_ADD_ITEM:
    return {
      ...state,
      items: [...state.items, action.item].reverse()
    };
  case REQUEST_REMOVE_ITEM: // now that we have an undo, we remove this locally first
    return {
      ...state,
      itemDeleted: state.items.find(item => item.id === action.itemToRemove), //save item
      items: state.items.filter(item => item.id !== action.itemToRemove)
    };
  case CANCEL_REMOVE_ITEM:
    return {
      ...state,
      items: [state.itemDeleted, ...state.items],
      itemDeleted: null, // clear saved item if canceled
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
  const id = props ? props.id : null;

  return _.reduce(state.currentCart.items, (acc, item) => {
    acc.quantity = acc.quantity + (item.quantity || 1);
    let linkedMember = getMemberById(state.currentCart, { id: item.added_by });

    if (id === item.added_by) {
      acc['my'].push(item);
    } else if (acc.others.find(member => member.id === linkedMember.id)) {
      const others = acc.others.filter(member => member.id !== linkedMember.id);
      let newMember = acc.others.find(member => member.id === linkedMember.id);
      newMember = {
        ...newMember,
        items: [...newMember.items, item]
      };
      acc = {
        ...acc,
        others: [...others, newMember]
      };
    } else {
      acc.others.push({
        id: item.added_by,
        email: linkedMember.email_address,
        name: linkedMember.name,
        items: [item]
      });
    }

    return acc;
  }, {
    my: [],
    others: [],
    quantity: 0
  });
};
