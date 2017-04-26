// react/actions/deals.js

import { REQUEST_DEALS, RECEIVE_DEALS, SELECT_DEAL, REMOVE_DEAL } from '../constants/ActionTypes';

const receive = (deals) => ({
  type: RECEIVE_DEALS,
  deals
});

const request = () => ({
  type: REQUEST_DEALS
});

export const selectDeal = (selectedIndex, deal) => ({
  type: SELECT_DEAL,
  deal,
  selectedIndex
})

export const removeDeal = (selectedIndex) => ({
  type: REMOVE_DEAL,
  selectedIndex
})

export function fetchDeals() {
  return async function (dispatch) {
    dispatch(request());

    try {
      const response = await fetch('/api/deals', {
        credentials: 'same-origin'
      });

      return dispatch(receive(await response.json()));
    } catch (e) {
      throw 'error in cart fetchDeals';
    }
  };
}
