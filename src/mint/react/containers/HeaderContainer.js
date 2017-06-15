import { connect } from 'react-redux';
import { Header } from '../components';

import {
  togglePopup,
  toggleSidenav,
  get
} from '../actions';

const mapStateToProps = (state, props) => {
  return {
    cart: state.cart,
    user: state.user
  };
};

const mapDispatchToProps = dispatch => ({
  _toggleLoginScreen: () => dispatch(togglePopup()),
  _toggleSidenav: () => dispatch(toggleSidenav())
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
