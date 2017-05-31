// react/reducers/cards.js

import { RECEIVE_CARDS, RECEIVE_CART, SELECT_CARD, REMOVE_CARD, RECEIVE_SEARCH, CLEAR_ITEM, RECEIVE_CATEGORY, LOGOUT } from '../constants/ActionTypes';

const initialState = { 
  cards: [], position: null 
};

export default (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_SEARCH:
      return {
        ...state,
        ...action.response
      }
    default:
      return state;
  }
}
