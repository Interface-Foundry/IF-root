import { connect } from 'react-redux';
import { Cart } from '../components';
import { fetchDeals } from '../actions/deals';
import { selectItem, removeItem } from '../actions/cart';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.cart.cart_id,
  addingItem: state.cart.addingItem,
  leader: state.cart.currentCart.leader,
  members: state.cart.currentCart.members,
  user_accounts: state.session.user_accounts,
  items: state.cart.currentCart.items,
  carts: state.cart.carts
});

const mapDispatchToProps = dispatch => ({
  fetchDeals: () => dispatch(fetchDeals()),
  selectItem: item => dispatch(selectItem(item)),
  removeItem: (cart_id, item_id) => dispatch(removeItem(cart_id, item_id))
});

export default connect(mapStateToProps, mapDispatchToProps)(Cart);
