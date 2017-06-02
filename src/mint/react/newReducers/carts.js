// react/reducers/otherCarts.js

import { RECEIVE_CARTS, RECEIVE_UPDATE_CART, LOGOUT, DELETE_CART } from '../constants/ActionTypes';

const initialState = {
  carts: [],
  archivedCarts: []
};

export default function otherCarts(state = initialState, action) {
  switch (action.type) {
    case 'CARTS_SUCCESS':
      return {
        ...state,
        ...action.response
      };
    case 'DELETE_CART_SUCCESS':
      return {
        ...state,
        carts: state.carts.filter(c => c.id !== action.response),
        archivedCarts: [...state.carts.filter(c => c.id === action.response), ...state.archivedCarts]
      };
    default:
      return state;
  }
}

//Selectors
export const getCartById = (state, props) => state.otherCarts.carts.find(cart => cart.id === props.id);
