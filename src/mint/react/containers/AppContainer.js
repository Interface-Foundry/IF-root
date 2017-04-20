import { connect } from 'react-redux';
import { App } from '../components';
import { fetchCart, fetchAllCarts, updateCart } from '../actions/cart';
import { addItem, removeItem } from '../actions/item';

import { getNameFromEmail } from '../utils';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.routing.location.pathname.match(/cart\/((\d|\w)+)/)[1], // TODO: switch to nonregex when react router allows it
  leader: state.currentCart.leader,
  carts: state.otherCarts.carts,
  currentUser: state.session.user_account,
  newAccount: state.session.newAccount,
  deals: state.deals.deals,
  item: state.item,
  currentCart: state.currentCart,
  cartName: state.currentCart.name ? state.currentCart.name : `${_.capitalize(getNameFromEmail(state.session.user_account ? state.session.user_account.email_address : null))}'s Group Cart`,
  items: state.currentCart.items
});
const mapDispatchToProps = dispatch => ({
	addItem: (cart_id, item_id, replace) => {
    dispatch(addItem(cart_id, item_id))
      .then(e => {
        replace(`/cart/${cart_id}/`);
      });
  },
  fetchCart: (cart_id) => dispatch(fetchCart(cart_id)),
  fetchAllCarts: () => dispatch(fetchAllCarts()),
  updateCart: (cart) => dispatch(updateCart(cart)),
  removeItem: (cart_id, item_id)=> dispatch(removeItem(cart_id, item_id))
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
