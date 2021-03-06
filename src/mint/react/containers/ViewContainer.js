// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { ActionCreators } from 'redux-undo';
import { replace } from 'react-router-redux';

import { View } from '../components';
import {
  toggleSidenav,
  togglePopup,
  likeCart,
  unlikeCart,
  cloneCart,
  addItem,
  fetchMetrics,
  selectTab,
  updateQuery,
  submitQuery,
  fetchCarts,
  updateCart
} from '../actions';

const mapStateToProps = (state, ownProps) => {
  const query = ownProps.history.location.search.match(/q=([^&$]+)/);
  return {
    search: query ? decodeURIComponent(query[1]) : null,
    urlSearch: !!query,
    user: state.user,
    cart: state.cart.present,
    sidenav: state.app.sidenav,
    selectedItemId: state.search.selectedItemId,
    popup: state.app.popup,
    tab: state.app.viewTab,
    oldCart: state.cart.past,
    showUndo: !!state.cart.past.length,
    searchLoading: state.search.loading
  };
};

const mapDispatchToProps = dispatch => ({
  togglePopup: () => dispatch(togglePopup()),
  toggleSidenav: () => dispatch(toggleSidenav()),
  likeCart: (id) => dispatch(likeCart(id)),
  unlikeCart: (id) => dispatch(unlikeCart(id)),
  cloneCart: (cart_id) => dispatch(cloneCart(cart_id)).then(() => {
    dispatch(fetchMetrics(cart_id))
      .then(() => dispatch(replace(`/cart/${cart_id}?toast=Cart Re-Kipped &status=success`)))
      .then(() => dispatch(fetchCarts()));

  }),
  undoRemove: ({ items = [], id: cartId = '' }, cartElder) => {
    const oldItems = cartElder[cartElder.length - 1].items,
      itemsSet = new Set(items),
      reAddedItems = oldItems.filter(i => !itemsSet.has(i));
    dispatch(addItem(cartId, reAddedItems[0].id)).then(() => {
      dispatch(ActionCreators.clearHistory());
    });
  },
  selectTab: (tab) => dispatch(selectTab(tab)),
  submitQuery: (query, store, locale) => {
    dispatch(updateQuery(query));
    dispatch(submitQuery(encodeURIComponent(query), store, locale));
  },
  updateCart: cart => dispatch(updateCart(cart)).then(() => dispatch(fetchCarts()))
});

export default connect(mapStateToProps, mapDispatchToProps)(View);