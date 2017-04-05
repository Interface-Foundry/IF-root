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

    // TODO: undo this hack
    // This is incredibly bad for when we do search
    // TODO TODO TODO
    item_id = item_id.includes('http') ? item_id : `https://www.amazon.com/dp/${item_id}`;
    console.log(item_id);
    try {
      const response = await fetch(`/api/itempreview?q=${item_id}`, {
        credentials: 'same-origin'
      });

      return dispatch(receive(await response.json()));
    } catch (e) {
      throw 'error in cart fetchItem';
    }
  };
}
