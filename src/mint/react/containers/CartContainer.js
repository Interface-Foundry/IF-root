import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { fetchCartItems, checkout } from '../actions'
import Cart from '../components/Cart'

const CartContainer = ({ items, total, checkout }) => (
  <Cart
    items={items}
    total={total}
    onCheckoutClicked={() => checkout(items)} />
)

const mapStateToProps = (state) => ({
  items: fetchCartItems(state)
})

export default connect(mapStateToProps)(CartContainer);
