import { connect } from 'react-redux';
import { Cart } from '../components';

import { fetchCart } from '../actions/cart';
import { fetchDeals } from '../actions/deals';

import { selectItem } from '../actions/cart';

const mapStateToProps = (state, ownProps) => ({
	cart_id: ownProps.match.params.cart_id,
  leader: state.cart.leader,
  members: state.cart.members,
  items: state.cart.items,
  addingItem: state.cart.addingItem
});

const mapDispatchToProps = dispatch => ({
	fetchCart: (cart_id) => dispatch(fetchCart(cart_id)),
  fetchDeals: () => dispatch(fetchDeals()),
  selectItem: item => dispatch(selectItem(item))
});

export default connect(mapStateToProps, mapDispatchToProps)(Cart);
