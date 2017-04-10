import { RECEIVE_DEALS } from '../constants/ActionTypes';

const initialState = { deals: [] };

export default function kipForm(state = initialState, action) {
  switch (action.type) {
    case RECEIVE_DEALS:
      return {
        deals: action.deals
      };
    default:
      return state;
  }
}