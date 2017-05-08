// react/containers/CartContainer.js

import { connect } from 'react-redux';
import { Cart } from '../components';
import { fetchDeals } from '../actions/deals';
import { selectItem, updateCart } from '../actions/cart';
import { cancelRemoveItem } from '../actions/item';
import { splitCartById } from '../reducers';
import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.currentCart.cart_id,
  addingItem: state.currentCart.addingItem,
  leader: state.currentCart.leader,
  members: state.currentCart.members,
  deals: state.deals.deals,
  user_account: state.session.user_account,
  items: splitCartById(state, state.session.user_account),
  locked: state.currentCart.locked,
  currentCart: state.currentCart,
  position: state.deals.position,
  carts: state.otherCarts.carts
});

const mapDispatchToProps = dispatch => ({
  fetchDeals: () => dispatch(fetchDeals()),
  selectItem: item => {
    ReactGA.event({
      category: 'Cart',
      action: 'Selected Item in Cart',
    });
    return dispatch(selectItem(item));
  },
  updateCart: (cart) => dispatch(updateCart(cart)),
  cancelRemoveItem: () => dispatch(cancelRemoveItem())
});

export default connect(mapStateToProps, mapDispatchToProps)(Cart);
