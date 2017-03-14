const ADD_TO_CART = 'ADD_TO_CART';
const REMOVE_FROM_CART = 'REMOVE_FROM_CART';

export const addToCartUnsafe = item => ({
  type: ADD_TO_CART,
  item: item
});

export const removeFromCart = item => ({
  type: REMOVE_FROM_CART,
  item: item
});

// export const addToCart = item => (dispatch, getState) => {
//   if (getState().products.byId[item].inventory > 0) {
//     dispatch(addToCartUnsafe(item))
//   }
// }
