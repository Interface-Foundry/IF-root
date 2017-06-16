// react/reducers/currentCart.js

import {
  ADDING_ITEM,
  ADD_MEMBER_TO_CART,
  RECEIVE_UPDATE_CART,
  RECEIVE_ITEMS,
  RECEIVE_ADD_ITEM,
  REQUEST_REMOVE_ITEM,
  RECEIVE_REMOVE_ITEM,
  CANCEL_REMOVE_ITEM,
  RECEIVE_INCREMENT_ITEM,
  RECEIVE_DECREMENT_ITEM,
  RECEIVE_UPDATE_ITEM,
  REQUEST_SET_STORE,
  REQUEST_CLEAR_CART,
  CANCEL_CLEAR_CART,
  RECEIVE_CLEAR_CART,
  LOGOUT
} from '../constants/ActionTypes';

const initialState = {
  members: [],
  items: [],
  oldItems: [],
  addingItem: false
};

export default function cart(state = initialState, action) {
  switch (action.type) {
  case LOGOUT:
    return {
      ...state
    };
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
  case RECEIVE_UPDATE_CART:
    if (action.updatedCart.id !== state.cart_id) return state;
    return {
      ...state,
      ...action.updatedCart,
      thumbnail_url: action.updatedCart.thumbnail_url || '//storage.googleapis.com/kip-random/head%40x2.png'
    };
  case 'CART_SUCCESS':
    return {
      ...state,
      ...action.response,
      thumbnail_url: action.response.thumbnail_url || '//storage.googleapis.com/kip-random/kip_head_whitebg.png',
      locked: action.response.locked || false,
      cart_id: action.response.id
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
      itemDeleted: null // clear saved item if canceled
    };
  case RECEIVE_REMOVE_ITEM:
    return {
      ...state,
      itemDeleted: null
    };
  case RECEIVE_INCREMENT_ITEM:
  case RECEIVE_DECREMENT_ITEM:
    return {
      ...state,
      items: state.items.map(item => item.id === action.item.id ? action.item : item) //replace item that matches with new one
    };
  case RECEIVE_UPDATE_ITEM:
    return {
      ...state,
      items: state.items.map(item => item.id === action.old_item_id ? { ...item, ...action.item } : item)
    };
  case REQUEST_SET_STORE:
    return {
      ...state,
      store: action.storeType
    };
  case REQUEST_CLEAR_CART:
    return {
      ...state,
      items: [],
      oldItems: state.items
    };
  case CANCEL_CLEAR_CART:
    return {
      ...state,
      items: state.oldItems,
      oldItems: []
    };
  case RECEIVE_CLEAR_CART:
    return {
      ...state,
      items: [],
      oldItems: []
    };
  default:
    return state;
  }
}

// Selector
export const getMemberById = (state, props) => [...state.members, state.leader].find(member => member.id === props.id);

export const splitCartById = (state, props) => {
  const id = props ? props.id : null;

  return state.currentCart.items.reduce((acc, item) => {
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