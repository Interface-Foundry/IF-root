import { connect } from 'react-redux';
import { Cart } from '../components';

import { fetchItems } from '../actions/cart';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.cart.cart_id,
  leader: state.cart.leader,
  members: state.cart.members,
  items: state.cart.items
});

const mapDispatchToProps = dispatch => ({
  fetchItems: cart_id => dispatch(fetchItems(cart_id))
});

export default connect(mapStateToProps, mapDispatchToProps)(Cart);
