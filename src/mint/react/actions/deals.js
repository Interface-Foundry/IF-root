import { REQUEST_DEALS, RECEIVE_DEALS } from '../constants/ActionTypes';

const receive = (deals) => ({
  type: RECEIVE_DEALS,
  deals
});

const request = () => ({
  type: REQUEST_DEALS
});

export function fetchDeals() {
  return async function (dispatch) {
    dispatch(request());

    try {
      const response = await fetch('/api/test/deals', {
        credentials: 'same-origin'
      });

      return dispatch(receive(await response.json()));
    } catch (e) {
      throw 'error in cart fetchDeals';
    }
  };
}