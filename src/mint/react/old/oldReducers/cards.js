// react/reducers/cards.js

import { RECEIVE_CARDS, RECEIVE_CART, SELECT_CARD, REMOVE_CARD, RECEIVE_SEARCH, CLEAR_ITEM, RECEIVE_CATEGORY, LOGOUT } from '../constants/ActionTypes';

const initialState = { cards: [], position: null };

export default function kipForm(state = initialState, action) {
  switch (action.type) {
  case LOGOUT:
    return initialState;
  case RECEIVE_CART:
    return {
      ...state,
      type: 'categories',
      cards: []
    };
  case CLEAR_ITEM:
    return {
      ...state,
      type: 'categories',
      cards: state.categories || []
    };
  case RECEIVE_CARDS:
    return {
      ...state,
      type: 'categories',
      categories: action.cards,
      cards: action.cards
    };
  case RECEIVE_SEARCH:
    return {
      ...state,
      type: 'search',
      cards: action.items
    };
  case RECEIVE_CATEGORY:
    return {
      ...state,
      type: 'categories-search',
      cards: action.items
    };
  case SELECT_CARD:
    return {
      ...state,
      position: action.selectedIndex,
      card: action.card
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