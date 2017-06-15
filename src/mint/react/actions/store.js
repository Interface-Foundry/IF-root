import { get, post } from './async';

export const fetchStores = () => (
  get(
    '/api/cart_type', 
    'STORES', 
    (type, json) => ({
      type: `${type}_SUCCESS`,
      response: json,
      receivedAt: Date.now()
    })
  )
);

export const setStore = (cart_id, store) => (
  post(
    `/api/cart/${cart_id}`, 
    'SET_STORE',
    store, 
    (type, json) => ({
      type: `${type}_SUCCESS`,
      response: json,
      receivedAt: Date.now()
    })
  )
);