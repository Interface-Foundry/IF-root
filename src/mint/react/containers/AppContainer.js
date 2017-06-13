// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { App } from '../components';
import { fetchCart, updateCart, checkoutCart } from '../actions/cart';
import { addItem, removeItem, clearItem } from '../actions/item';
import { logout, login, validateCode } from '../actions/session';
import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => {
  const params = decodeURIComponent(state.routing.location.search),
    toast = params.match(/toast=([^&$]+)/),
    status = params.match(/status=([^&$]+)/);
  const cart_id = state.routing.location.pathname.match(/cart\/((\d|\w)+)/);
  return {
    cart_id: cart_id ? cart_id[1] : null, // TODO: switch to nonregex when react router allows it
    toast: toast ? toast[1] : null,
    status: status ? status[1] : null,
    leader: state.currentCart.leader,
    carts: state.otherCarts.carts,
    archivedCarts: state.otherCarts.archivedCarts,
    user_account: state.session.user_account,
    newAccount: state.session.newAccount,
    cards: state.cards.cards,
    position: state.cards.position,
    item: state.item,
    currentCart: state.currentCart,
    cartName: state.currentCart.name ? state.currentCart.name : state.currentCart.leader ? state.currentCart.leader.name + '\'s Kip Cart' : 'New Kip Cart',
    items: state.currentCart.items,
    session_id: state.session.id
  };
};

const mapDispatchToProps = dispatch => ({
  addItem: (cart_id, item_id, replace) => {
    ReactGA.event({
      category: 'Cart',
      action: 'Item Added',
    });
    return dispatch(addItem(cart_id, item_id))
      .then(e => {
        replace(`/cart/${cart_id}/`);
      });
  },
  fetchCart: (cart_id) => {
    ReactGA.event({
      category: 'Cart',
      action: 'Getting Cart ' + cart_id,
    });
    return dispatch(fetchCart(cart_id));
  },
  updateCart: (cart) => dispatch(updateCart(cart)),
  clearItem: () => dispatch(clearItem()),
  removeItem: (cart_id, item_id) => {
    ReactGA.event({ category: 'Cart', action: 'removed item from cart' });
    return dispatch(removeItem(cart_id, item_id));
  },
  checkoutCart: (cart_id) => dispatch(checkoutCart(cart_id)),
  login: (cart_id, email) => dispatch(login(cart_id, email)),
  validateCode: (email, code) => dispatch(validateCode(email, code)),
  logout: () => {
    dispatch(logout()).then(() => {
      // Navigate away on callback
      console.log('NB-Appcontainer: ', 'navigate away on callback')
    })
    // This needs a way to navigate to the home page
    // window.location.href doesn't work tho
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(App);