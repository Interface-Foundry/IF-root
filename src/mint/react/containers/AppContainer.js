// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { App } from '../components';

import {
  toggleSidenav,
  togglePopup,
  fetchCart,
  fetchMetrics,
  navigateRightResults,
  navigateLeftResults,
  getMoreSearchResults,
  fetchInvoiceByCart,
  setHeaderCheckout
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
    cart: state.cart.present,
    user: state.user,
    tab: state.app.viewTab,
    cart_id: state.cart.present.id,
    sidenav: state.app.sidenav,
    query: state.search.query,
    page: state.search.page,
    selectedItemId: state.search.selectedItemId,
    popup: state.app.popup,
    lazyLoading: state.search.lazyLoading
  };
};

const mapDispatchToProps = dispatch => ({
  togglePopup: () => dispatch(togglePopup()),
  toggleSidenav: () => dispatch(toggleSidenav()),
  fetchCart: (id) => dispatch(fetchCart(id)),
  fetchMetrics: (id) => dispatch(fetchMetrics(id)),
  fetchInvoiceByCart: (id) => dispatch(fetchInvoiceByCart(id)),
  navigateRightResults: () => dispatch(navigateRightResults()),
  navigateLeftResults: () => dispatch(navigateLeftResults()),
  getMoreSearchResults: (query, store, locale, page) => dispatch(getMoreSearchResults(encodeURIComponent(query), store, locale, page)),
  setHeaderCheckout: (show) => dispatch(setHeaderCheckout(show))

});

export default connect(mapStateToProps, mapDispatchToProps)(App);
