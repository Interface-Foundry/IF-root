// react/reducers/otherCarts.js

import { RECEIVE_CARTS, RECEIVE_UPDATE_CART, LOGOUT } from '../constants/ActionTypes';
const initialState = {
  carts: []
};
export default function otherCarts(state = initialState, action) {
  switch (action.type) {
  case LOGOUT:
    return initialState;
  case RECEIVE_CARTS:
    return {
      ...state,
      carts: action.carts.reverse()
    };
  case RECEIVE_UPDATE_CART:
    return {
      ...state,
      carts: state.carts.map(c => (c.id === action.updatedCart.id ? { ...c, thumbnail_url: action.updatedCart.thumbnail_url, name: action.updatedCart.name, locked: action.updatedCart.locked } : c))
        .reverse()
    };
  default:
    return state;
  }
}

//Selectors
export const getCartById = (state, props) => state.otherCarts.carts.find(cart => cart.id === props.id);
