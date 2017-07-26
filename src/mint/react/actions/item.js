import { get, post, del } from './async';

export const editItem = item_id => ({
  type: 'EDIT_ITEM',
  response: {
    editId: item_id
  }
});

export const updateItem = (item_id, updatedValues, option_ids) => post(
  `/api/item/${item_id}`,
  'UPDATE_ITEM', { updateItem: {...updatedValues}, option_ids },
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: {
      item: json,
      editId: null
    },
    receivedAt: Date.now()
  })
);

export const navigateAffilateUrl = item_id => get(
  `/api/item/${item_id}/clickthrough`,
  'AFFILIATE_URL',
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const addItem = (cart_id, item_id, option_ids) => post(
  `/api/cart/${cart_id}/item`,
  'ADD_ITEM', { item_id, option_ids },
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

export const fetchSearchItem = item_id => get(
  `/api/item/${item_id}`,
  'SEARCH_ITEM',
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: {
      item: json
    },
    receivedAt: Date.now()
  })
);

export const fetchItemVariation = (option_asin, store, locale) => get(
  `/api/itempreview?q=${option_asin}&store=${store}&store_locale=${locale}`,
  'ITEM_OPTION',
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: {
      item: json[0]
    },
    receivedAt: Date.now()
  })
);

export const copyItem = (cart_id, item_id) => post(
  `/api/item/${item_id}/clone/${cart_id}`,
  'COPY_ITEM', {},
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
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
