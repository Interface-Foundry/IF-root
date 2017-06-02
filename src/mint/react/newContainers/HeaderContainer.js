import { connect } from 'react-redux';
import { Header } from '../newComponents';

import { 
  logout,	
	toggleModal,
	toggleSidenav
} from '../newActions';

const mapStateToProps = (state, props) => {
  return {
    cart: state.cart,
    user: state.user
  }
};

const mapDispatchToProps = dispatch => ({
  _toggleLoginScreen: () => dispatch(toggleModal()),
  _toggleSidenav: () => dispatch(toggleSidenav()),
  logout: () => {
    dispatch(get('/api/logout', 'SESSION'));
    dispatch(logout());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
