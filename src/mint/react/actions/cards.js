// react/actions/cards.js

import { REQUEST_CARDS, RECEIVE_CARDS, SELECT_CARD, REMOVE_CARD } from '../constants/ActionTypes';

const receive = (cards) => ({
  type: RECEIVE_CARDS,
  cards
});

const request = () => ({
  type: REQUEST_CARDS
});

export const selectCard = (selectedIndex, card) => ({
  type: SELECT_CARD,
  card,
  selectedIndex
});

export const removeCard = (selectedIndex) => ({
  type: REMOVE_CARD,
  selectedIndex
});

export function fetchCards() {
  return async function (dispatch) {
    dispatch(request());

    try {
      const response = await fetch('/api/categories', {
        credentials: 'same-origin'
      });

      return dispatch(receive(await response.json()));
    } catch (e) {
      throw 'error in cart fetchCards';
    }
  };
}
