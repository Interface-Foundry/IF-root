import { connect } from 'react-redux';
import { App } from '../components';
import { fetchCart } from '../actions/cart';

const mapStateToProps = (state, ownProps) => ({
  cart_id: ownProps.match.params.cart_id,
  leader: state.cart.leader,
  newAccount: state.session.newAccount
});
const mapDispatchToProps = dispatch => ({
  fetchCart: (cart_id) => dispatch(fetchCart(cart_id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
