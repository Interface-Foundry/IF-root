// react/reducers/cards.js

import { RECEIVE_CARDS, SELECT_CARD, REMOVE_CARD, RECEIVE_SEARCH } from '../constants/ActionTypes';

const initialState = { cards: [], position: null };

export default function kipForm(state = initialState, action) {
  switch (action.type) {
  case RECEIVE_CARDS:
    return {
      ...state,
      type: 'categories',
      cards: action.cards
    };
  case RECEIVE_SEARCH:
    return {
      ...state,
      type: 'search',
      cards: action.items
    };
  case SELECT_CARD:
    return {
      ...state,
      position: action.selectedIndex
    };
  case REMOVE_CARD:
    return {
      ...state,
      cards: state.cards.filter((card, index) => index !== action.selectedIndex),
      position: null
    };
  default:
    return state;
  }
}
