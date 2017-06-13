// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { App } from '../newComponents';

import { 
  toggleSidenav,
  togglePopup,
  fetchCart,
  fetchMetrics
} from '../newActions';

import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => {
  return {
    cart_id: state.cart.id,
    sidenav: state.app.sidenav,
    popup: state.app.popup
  };
};

const mapDispatchToProps = dispatch => ({
  togglePopup: () => dispatch(togglePopup()),
  toggleSidenav: () => dispatch(toggleSidenav()),
  fetchCart: (id) => dispatch(fetchCart(id)),
  fetchMetrics: (id) => dispatch(fetchMetrics(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(App);




