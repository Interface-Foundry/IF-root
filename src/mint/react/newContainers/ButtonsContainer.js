import { connect } from 'react-redux';
import { Buttons } from '../newComponents';
import { push } from 'react-router-redux'

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
  },
  push: (url) => dispatch(push(url))
});

export default connect(mapStateToProps, mapDispatchToProps)(Buttons);
