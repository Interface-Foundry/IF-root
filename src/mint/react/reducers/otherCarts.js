import { RECEIVE_CARTS, RECEIVE_UPDATE_CART } from '../constants/ActionTypes';
const initialState = {
  carts: []
};
export default function otherCarts(state = initialState, action) {
  switch (action.type) {
  case RECEIVE_CARTS:
    return {
      ...state,
      carts: action.carts
    };
  case RECEIVE_UPDATE_CART:
    return {
      ...state,
      carts: _.map(state.carts, (c) => ( c.id === action.updatedCart.id ? { ...c, thumbnail_url: action.updatedCart.thumbnail_url, name: action.updatedCart.name } : c))
    }
  default:
    return state;
  }
}

//Selectors
export const getCartById = (state, props) => state.otherCarts.carts.find(cart => cart.id === props.id)