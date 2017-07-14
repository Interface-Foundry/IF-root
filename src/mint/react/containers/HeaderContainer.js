import { connect } from 'react-redux';
import { Header } from '../components';
import { togglePopup, toggleSidenav, selectTab } from '../actions';

const mapStateToProps = (state, props) => {
  return {
    cartId: state.cart.present.id,
    numCarts: state.carts.carts.length,
    userName: state.user.name||null,
    showCheckout: state.app.showHeaderCheckout
  };
};

const mapDispatchToProps = dispatch => ({
  _toggleLoginScreen: () => dispatch(togglePopup()),
  _toggleSidenav: () => dispatch(toggleSidenav()),
  selectTab: (tab) => dispatch(selectTab(tab))
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
