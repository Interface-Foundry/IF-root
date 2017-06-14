import { connect } from 'react-redux';
import { Sidenav } from '../../react-common/components';
import { push } from 'react-router-redux';

import {
  get,
  logout,
  toggleModal,
  toggleSidenav
} from '../newActions';

const mapStateToProps = (state, props) => {
  return {
    cart_id: state.cart.id,
    carts: state.carts.carts || [],
    archivedCarts: state.carts.archivedCarts || [],
    user_account: state.user,
    currentCart: state.cart
  };
};

const mapDispatchToProps = dispatch => ({
  get: (url, type) => dispatch(get(url, type)),
  _toggleLoginScreen: () => dispatch(toggleModal()),
  _toggleSidenav: () => dispatch(toggleSidenav()),
  logout: () => {
    dispatch(get('/api/logout', 'SESSION'));
    dispatch(logout());
  },
  push: (url) => dispatch(push(url))
});

export default connect(mapStateToProps, mapDispatchToProps)(Sidenav);
