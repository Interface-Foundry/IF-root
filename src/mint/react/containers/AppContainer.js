// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { App } from '../components';
import { fetchCart, fetchAllCarts, updateCart, checkoutCart } from '../actions/cart';
import { logout } from '../actions/session';
import { addItem, removeItem } from '../actions/item';
import { removeDeal } from '../actions/deals';

import { getNameFromEmail } from '../utils';

const mapStateToProps = (state, ownProps) => {
  const params = decodeURIComponent(state.routing.location.search),
    toast = params.match(/toast=([^&$]+)/),
    status = params.match(/status=([^&$]+)/);
  return {
    cart_id: state.routing.location.pathname.match(/cart\/((\d|\w)+)/)[1], // TODO: switch to nonregex when react router allows it
    toast: toast ? toast[1] : null,
    status: status ? status[1] : null,
    leader: state.currentCart.leader,
    carts: state.otherCarts.carts,
    currentUser: state.session.user_account,
    newAccount: state.session.newAccount,
    deals: state.deals.deals,
    position: state.deals.position,
    item: state.item,
    currentCart: state.currentCart,
    cartName: state.currentCart.name ? state.currentCart.name : `${_.capitalize(getNameFromEmail(state.session.user_account ? state.session.user_account.email_address : null))}'s Group Cart`,
    items: state.currentCart.items,
    session_id: state.session.id
  };
};
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
  removeItem: (cart_id, item_id) => dispatch(removeItem(cart_id, item_id)),
  removeDeal: (index) => {
    setTimeout(() => {
      dispatch(removeDeal(index))
    }, 100)
  },
  checkoutCart: (cart_id) => dispatch(checkoutCart(cart_id)),
  logout: () => dispatch(logout())
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
