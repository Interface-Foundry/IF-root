import { connect } from 'react-redux';
import { Sidenav } from '../../react-common/Components';

import { get, logout } from '../actions';

const mapStateToProps = (state, props) => ({
  carts: state.auth.carts,
  archivedCarts: state.auth.archivedCarts,
  user_account: state.auth.user_account,
  currentCart: state.auth.carts[0]
});

const mapDispatchToProps = dispatch => ({
  get: (url, type) => dispatch(get(url, type)),
  logout: () => dispatch(logout())
});

export default connect(mapStateToProps, mapDispatchToProps)(Sidenav);
