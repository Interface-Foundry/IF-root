import { connect } from 'react-redux';
import { App } from '../components';
import { fetchCart, fetchAllCarts } from '../actions/cart';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.routing.location.pathname.match(/cart\/((\d|\w)+)/)[1], // TODO: switch to nonregex when react router allows it
  leader: state.cart.currentCart.leader,
  carts: state.cart.carts,
  currentUser: state.session.user_accounts[0],
  newAccount: state.session.newAccount
});
const mapDispatchToProps = dispatch => ({
  fetchCart: (cart_id) => dispatch(fetchCart(cart_id)),
  fetchAllCarts: () => dispatch(fetchAllCarts())
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
