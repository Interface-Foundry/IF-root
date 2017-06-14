import { get, post, del } from './async';

export const editItem = item_id => ({
  type: 'EDIT_ITEM',
  response: {
    editId: item_id
  }
});

export const updateItem = (item_id, updatedValues) => post(
  `/api/item/${item_id}`,
  'UPDATE_ITEM', { ...updatedValues },
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: {
      item: json,
      editId: null
    },
    receivedAt: Date.now()
  })
);

export const addItem = (cart_id, item_id) => post(
  `/api/cart/${cart_id}/item`,
  'ADD_ITEM', { item_id },
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const fetchItem = item_id => get(
  `/api/item/${item_id}`,
  'ITEM',
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: {
      item: json
    },
    receivedAt: Date.now()
  })
);

export const removeItem = (cart_id, item_id) => del(
  `/api/cart/${cart_id}/item/${item_id}`,
  'REMOVE_ITEM',
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: item_id,
    receivedAt: Date.now()
  })
);
