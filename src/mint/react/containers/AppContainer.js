// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { App } from '../components';

import {
  toggleSidenav,
  togglePopup,
  fetchCart,
  fetchMetrics
} from '../actions';

const mapStateToProps = (state, ownProps) => {
  const params = decodeURIComponent(state.routing.location.search),
    toast = params.match(/toast=([^&$]+)/),
    status = params.match(/status=([^&$]+)/);
  return {
    toast: toast ? toast[1] : null,
    status: status ? status[1] : null,
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
