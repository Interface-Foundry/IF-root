import { connect } from 'react-redux';
import { Sidenav } from '../../react-common/Components';

import { get, logout } from '../actions';

const mapStateToProps = (state, props) => ({
  carts: state.auth.carts,
  archivedCarts: state.auth.archivedCarts,
  user_account: state.auth.user_account,
  currentCart: state.auth.carts.length ? state.auth.carts[0] : {}
});

const mapDispatchToProps = dispatch => ({
  logout: () => {
    dispatch(get('/api/logout', 'SESSION'));
    dispatch(logout());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Sidenav);
