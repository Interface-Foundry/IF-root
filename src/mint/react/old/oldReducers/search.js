// react/reducers/cards.js

import { RECEIVE_SEARCH } from '../constants/ActionTypes';

const initialState = {
  cards: [],
  position: null
};

export default (state = initialState, action) => {
  switch (action.type) {
  case RECEIVE_SEARCH:
    return {
      ...state,
      ...action.response
    };
  default:
    return state;
  }
};