import { connect } from 'react-redux';
import { Cart } from '../components';

import { fetchItems, addItem } from '../actions/cart';

const mapStateToProps = (state, ownProps) => ({
  cart_id: ownProps.cart_id,
  items: state.cart.items
});

const mapDispatchToProps = dispatch => ({
  fetchItems: cart_id => dispatch(fetchItems(cart_id)),
  addItem: (cart_id, url) => dispatch(addItem(cart_id, url))
})

export default connect(mapStateToProps, mapDispatchToProps)(Cart);