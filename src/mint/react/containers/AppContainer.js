// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { App } from '../components';

import {
  toggleSidenav,
  togglePopup,
  fetchCart,
  fetchMetrics,
  navigateRightResults,
  navigateLeftResults
} from '../actions';

const mapStateToProps = (state, ownProps) => {
  // We should try and integrate this into redux... maybe... hmmmm hmmmmmmmmmmmmmmmmmm... maybe not
  const params = decodeURIComponent(state.routing.location.search),
    toast = params.match(/toast=([^&$]+)/),
    status = params.match(/status=([^&$]+)/);
  return {
    toast: toast ? toast[1] : null,
    status: status ? status[1] : null,
    loading: state.app.loading,
    cart: state.cart,
    user: state.user,
    sidenav: state.app.sidenav,
    selectedItemId: state.search.selectedItemId,
    popup: state.app.popup
  };
};

const mapDispatchToProps = dispatch => ({
  togglePopup: () => dispatch(togglePopup()),
  toggleSidenav: () => dispatch(toggleSidenav()),
  fetchCart: (id) => dispatch(fetchCart(id)),
  fetchMetrics: (id) => dispatch(fetchMetrics(id)),
  navigateRightResults: () => dispatch(navigateRightResults()),
  navigateLeftResults: () => dispatch(navigateLeftResults())
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
