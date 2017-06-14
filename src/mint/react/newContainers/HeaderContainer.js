import { connect } from 'react-redux';
import { Header } from '../newComponents';

import {
  logout,
  togglePopup,
  toggleSidenav,
  get
} from '../newActions';

const mapStateToProps = (state, props) => {
  return {
    cart: state.cart,
    user: state.user
  };
};

const mapDispatchToProps = dispatch => ({
  _toggleLoginScreen: () => dispatch(togglePopup()),
  _toggleSidenav: () => dispatch(toggleSidenav()),
  logout: () => {
    dispatch(get('/api/logout', 'SESSION'));
    dispatch(logout());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
