import { get, post, del, put } from './async';

export const fetchCart = cart_id => get(
  `/api/cart/${cart_id}`,
  'CART',
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const fetchCarts = () => get(
  '/api/carts',
  'CARTS',
  (type, json) => {
    const carts = json.map(c => ({ ...c, locked: c.locked || false }));

    return {
      type: `${type}_SUCCESS`,
      response: {
        archivedCarts: carts.filter(cart => cart.locked).reverse(),
        carts: carts.filter(cart => !cart.locked).reverse()
      },
      receivedAt: Date.now()
    };
  }
);

export const fetchMetrics = cart_id => get(
  `/api/cart/${cart_id}/metrics`,
  'METRICS',
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const cloneCart = cart_id => get(
  `/api/cart/${cart_id}/clone`,
  'CLONE_CART',
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const reorderCart = cart_id => get(
  `/api/cart/${cart_id}/reorder`,
  'CART',
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const updateCart = cart => post(
  `/api/cart/${cart.id}`,
  'UPDATE_CART',
  cart,
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const deleteCart = cart_id => del(
  `/api/cart/${cart_id}`,
  'DELETE_CART',
  (type) => ({
    type: `${type}_SUCCESS`,
    response: cart_id,
    receivedAt: Date.now()
  })
);

export const likeCart = cart_id => post(
  `/api/likes/${cart_id}`,
  'LIKE_CART', {},
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: {
      likes: json
    },
    receivedAt: Date.now()
  })
);

export const unlikeCart = cart_id => put(
  `/api/likes/${cart_id}`,
  'LIKE_CART', {},
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: {
      likes: json
    },
    receivedAt: Date.now()
  })
);

export const updatePrivacy = (cart_id, privacy) => put(
  `/api/cart/${cart_id}/privacy/${privacy}`,
  'UPDATE_CART', {},
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: json,
    receivedAt: Date.now()
  })
);

export const clearCart = cart_id => del(
  `/api/cart/${cart_id}/clear`,
  'CLEAR_CART',
  (type) => ({
    type: `${type}_SUCCESS`,
    response: cart_id,
    receivedAt: Date.now()
  })
);
