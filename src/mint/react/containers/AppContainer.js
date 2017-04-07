import { connect } from 'react-redux';
import { App } from '../components';
import { fetchCart, fetchAllCarts } from '../actions/cart';

const mapStateToProps = (state, ownProps) => ({
  cart_id: ownProps.match.params.cart_id,
  leader: state.cart.currentCart.leader,
  newAccount: state.session.newAccount
});
const mapDispatchToProps = dispatch => ({
  fetchCart: (cart_id) => dispatch(fetchCart(cart_id)),
  fetchAllCarts: () => dispatch(fetchAllCarts())
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
