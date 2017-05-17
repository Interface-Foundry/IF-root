// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { App } from '../components';
import { fetchCart, fetchAllCarts, updateCart, checkoutCart } from '../actions/cart';
import { logout, login } from '../actions/session';
import { addItem, removeItem, clearItem } from '../actions/item';
import { removeCard } from '../actions/cards';
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
    currentUser: state.session.user_account,
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
  fetchAllCarts: () => dispatch(fetchAllCarts()),
  updateCart: (cart) => dispatch(updateCart(cart)),
  clearItem: () => dispatch(clearItem()),
  removeItem: (cart_id, item_id) => {
    ReactGA.event({ category: 'Cart', action: 'removed item from cart' });
    return dispatch(removeItem(cart_id, item_id));
  },
  removeCard: (index) => {
    setTimeout(() => {
      dispatch(removeDeal(index));
    }, 100);
  },
  checkoutCart: (cart_id) => dispatch(checkoutCart(cart_id)),
  login: (cart_id, email) => dispatch(login(cart_id, email)),
  logout: () => dispatch(logout())
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
