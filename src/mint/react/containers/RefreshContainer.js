// react/containers/RefreshContainer.js

import { connect } from 'react-redux';
import { Refresh } from '../components';
import { updateUser, fetchCart, fetchCarts, fetchMetrics } from '../actions';

const mapStateToProps = (state, ownProps) => ({
  cartId: state.cart.present.id,
  userId: state.user.id,
  loading: state.app.loading
});

const mapDispatchToProps = dispatch => ({
  refresh: (cartId, userId) => {
    dispatch(updateUser(userId));
    dispatch(fetchCart(cartId));
    dispatch(fetchMetrics(cartId));
    dispatch(fetchCarts());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Refresh);
