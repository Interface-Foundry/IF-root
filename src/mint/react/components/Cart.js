import React, { PropTypes } from 'react'

const Cart = ({ items, cart_id }) => {
  const hasItems = items.length > 0;
  console.log(items);
  console.log(hasItems)
  const nodes = hasItems ? (
    items.map(item =>
      <div>{JSON.stringify(item, null, 2)}</div>
    )
  ) : (
    <em>Please add some products to the cart.</em>
  );

  return (
    <div>
      <h3>Cart</h3>
      <div>{nodes}</div>
      <button disabled={hasItems ? '' : 'disabled'}>
        Checkout
      </button>
    </div>
  );
};

export default Cart;
