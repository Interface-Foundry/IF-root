import { connect } from 'react-redux';
import { Cart } from '../components';
import { fetchDeals } from '../actions/deals';
import { selectItem } from '../actions/cart';
import { removeItem, incrementItem, decrementItem } from '../actions/item';
import { splitCartById } from '../reducers';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.currentCart.cart_id,
  addingItem: state.currentCart.addingItem,
  leader: state.currentCart.leader,
  members: state.currentCart.members,
  user_accounts: state.session.user_accounts,
  items: splitCartById(state, state.session.user_accounts[0]),
  carts: state.otherCarts.carts
});

const mapDispatchToProps = dispatch => ({
  fetchDeals: () => dispatch(fetchDeals()),
  selectItem: item => dispatch(selectItem(item)),
  removeItem: (cart_id, item_id) => dispatch(removeItem(cart_id, item_id)),
  incrementItem: (item_id, quantity) => dispatch(incrementItem(item_id, quantity)),
  decrementItem: (item_id, quantity) => dispatch(decrementItem(item_id, quantity)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Cart);
