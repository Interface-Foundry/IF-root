import { get, post } from './'

export function fetchCart(cart_id) {
  return get(`/api/cart/${cart_id}`, 'CART');
}

export function fetchCarts() {
  return get('/api/carts', 'CARTS');
}