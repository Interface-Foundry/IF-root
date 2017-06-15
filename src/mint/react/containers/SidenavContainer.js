import { connect } from 'react-redux';
import { Sidenav } from '../../react-common/components';
import { push } from 'react-router-redux';

import {
  get,
  togglePopup,
  toggleSidenav
} from '../actions';

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
  _toggleLoginScreen: () => dispatch(togglePopup()),
  _toggleSidenav: () => dispatch(toggleSidenav()),
  push: (url) => dispatch(push(url))
});

export default connect(mapStateToProps, mapDispatchToProps)(Sidenav);
