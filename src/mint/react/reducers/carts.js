// react/reducers/otherCarts.js

const initialState = {
  carts: [],
  archivedCarts: []
};

export default function otherCarts(state = initialState, action) {
  switch (action.type) {
  case 'CARTS_SUCCESS':
    return {
      carts: action.response.filter(c => !c.locked),
      archivedCarts: action.response.filter(c => c.locked)
    };
  case 'DELETE_CART_SUCCESS':
    return {
      ...state,
      carts: state.carts.filter(c => c.id !== action.response),
      archivedCarts: state.archivedCarts.filter(c => c.id !== action.response)
    };
  default:
    return state;
  }
}

//Selectors
export const getCartById = (state, props) => state.otherCarts.carts.find(cart => cart.id === props.id);