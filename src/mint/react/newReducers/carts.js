// react/reducers/otherCarts.js

import { RECEIVE_CARTS, RECEIVE_UPDATE_CART, LOGOUT, DELETE_CART } from '../constants/ActionTypes';

const initialState = {
  carts: [],
  archivedCarts: []
};

export default function otherCarts(state = initialState, action) {
  switch (action.type) {
    case RECEIVE_CARTS:
      let carts = action.carts.map(c => ({ ...c, locked: c.locked || false }));
      return {
        ...state,
        archivedCarts: carts.filter(cart => cart.locked)
          .reverse(),
        carts: carts.filter(cart => !cart.locked)
          .reverse(),
      };
    case RECEIVE_UPDATE_CART:
      carts = state.carts.map(c => ({ ...c, locked: c.locked || false }));
      const archivedCarts = state.archivedCarts.map(c => ({ ...c, locked: c.locked || false }));
      return {
        ...state,
        carts: carts
          .map(c => (
            c.id === action.updatedCart.id
            ? { ...c, ...action.updatedCart }
            : c))
          .reverse(),
        archivedCarts: archivedCarts
          .map(c => (
            c.id === action.updatedCart.id
            ? { ...c, ...action.updatedCart }
            : c))
          .reverse()
      };
    case DELETE_CART:
      return {
        ...state,
        carts: state.carts.filter(c => c.id !== action.cart_id),
        archivedCarts: [...state.carts.filter(c => c.id === action.cart_id), ...state.archivedCarts]
      };
    default:
      return state;
  }
}

//Selectors
export const getCartById = (state, props) => state.otherCarts.carts.find(cart => cart.id === props.id);
