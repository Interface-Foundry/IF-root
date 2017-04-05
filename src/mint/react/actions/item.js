import { REQUEST_ITEM, RECEIVE_ITEM, SELECT_ITEM } from '../constants/ActionTypes';

const receive = (item) => ({
  type: RECEIVE_ITEM,
  item
});

const request = () => ({
  type: REQUEST_ITEM
});

export const selectItem = (item) => ({
  type: SELECT_ITEM,
  item
});

export function fetchItem(item_id) {
  return async function (dispatch) {
    dispatch(request());

    try {
      const response = await fetch('/api/test/item', {
        credentials: 'same-origin'
      });

      return dispatch(receive(await response.json()));
    } catch (e) {
      throw 'error in cart fetchItem';
    }
  };
}
