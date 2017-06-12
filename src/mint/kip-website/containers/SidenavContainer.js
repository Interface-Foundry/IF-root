import { connect } from 'react-redux';
import { Sidenav } from '../../react-common/components';

import { 
	get,
  logout,	
	toggleModal,
	toggleSidenav
} from '../actions';

const mapStateToProps = (state, props) => ({
  carts: state.auth.carts,
  archivedCarts: state.auth.archivedCarts,
  user_account: state.auth.user_account,
  currentCart: state.auth.carts.length ? state.auth.carts[0] : {}
});

const mapDispatchToProps = dispatch => ({
  get: (url, type) => dispatch(get(url, type)),
  _toggleLoginScreen: () => dispatch(toggleModal()),
  _toggleSidenav: () => dispatch(toggleSidenav()),
  logout: () => {
    dispatch(get('/api/logout', 'SESSION'));
    dispatch(logout());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Sidenav);
