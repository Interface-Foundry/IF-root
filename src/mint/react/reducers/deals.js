import { RECEIVE_DEALS } from '../constants/ActionTypes';

const initialState = [];

export default function kipForm(state = initialState, action) {
  switch (action.type) {
    case RECEIVE_DEALS:
      return [
        ...action.deals
      ];
    default:
      return state;
  }
}
