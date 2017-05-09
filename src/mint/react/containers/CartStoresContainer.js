// react/containers/CartStoresContainer.js

import { connect } from 'react-redux';
import { fetchStores, setStore } from '../actions/cartStores';
import { CartStore } from '../components';
import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => ({
  store: state.currentCart.store,
  choices: state.cartStores.stores
});

const mapDispatchToProps = dispatch => ({
  setStore: (cart_id, type) => {
    ReactGA.event({
      category: 'Cart',
      action: `Set type to ${type}`,
    });
    return dispatch(setStore(cart_id, type));
  },
  fetchStores: () => dispatch(fetchStores())
});

export default connect(mapStateToProps, mapDispatchToProps)(CartStore);
