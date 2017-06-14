// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { Stores } from '../newComponents';

import {
  toggleSidenav,
  togglePopup,
  setStore
} from '../newActions';

import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => {
  return {
    cart: state.cart,
    stores: state.stores,
    user: state.user
  };
};

const mapDispatchToProps = dispatch => ({
  togglePopup: () => dispatch(togglePopup()),
  toggleSidenav: () => dispatch(toggleSidenav()),
  setStore: (cart_id, type) => {
    ReactGA.event({
      category: 'Cart',
      action: `Set type to ${type}`
    });
    return dispatch(setStore(cart_id, type));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Stores);
