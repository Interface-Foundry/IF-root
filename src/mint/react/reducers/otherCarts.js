import { RECEIVE_CARTS } from '../constants/ActionTypes';
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
  default:
    return state;
  }
}
