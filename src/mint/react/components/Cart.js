import React, { PropTypes } from 'react'
import Item from './Item'

const Cart  = ({ products, onCheckoutClicked }) => {
  const hasProducts = products.length > 0
  const nodes = hasProducts ? (
    products.map(item =>
      <Item
        title={item.title}
        quantity={item.quantity}
        key={item.id}
      />
    )
  ) : (
    <em>Please add some products to the cart.</em>
  )

  return (
    <div>
      <h3>Cart</h3>
      <div>{nodes}</div>
      <button onClick={onCheckoutClicked}
        disabled={hasItems ? '' : 'disabled'}>
        Checkout
      </button>
    </div>
  )
}

Cart.propTypes = {
  products: PropTypes.array,
  total: PropTypes.string,
  onCheckoutClicked: PropTypes.func
}

export default Cart