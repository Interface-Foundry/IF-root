import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { getCartItems } from '../reducers'
import Cart from '../components/Cart'

const CartContainer = ({ items, total, checkout }) => (
  <Cart
    items={items}
    total={total}
    onCheckoutClicked={() => checkout(items)} />
)

CartContainer.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired
  })).isRequired,
}

const mapStateToProps = (state) => ({
  items: getCartItems(state)
})

export default connect(mapStateToProps)(CartContainer);