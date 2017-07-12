import { connect } from 'react-redux';
import { Header } from '../components';
import { togglePopup, toggleSidenav, selectTab } from '../actions';

const mapStateToProps = (state, props) => {
  return {
    cart: state.cart.present,
    numCarts: state.carts.carts.length,
    user: state.user
  };
};

const mapDispatchToProps = dispatch => ({
  _toggleLoginScreen: () => dispatch(togglePopup()),
  _toggleSidenav: () => dispatch(toggleSidenav()),
  selectTab: (tab) => dispatch(selectTab(tab))
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
