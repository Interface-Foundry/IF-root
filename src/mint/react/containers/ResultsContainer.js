// react/containers/SettingsContainer.js

import { connect } from 'react-redux';
import { replace } from 'react-router-redux';
import { ActionCreators } from 'redux-undo';

import { Results } from '../components';
import { toggleHistory, submitQuery, addItem, selectItem, togglePopup, updateItem, navigateRightResults, navigateLeftResults, getMoreSearchResults, fetchSearchItem, fetchItemVariation, removeItem } from '../actions';
import { isUrl, addSearchHistory, splitAndMergeSearchWithCart, sleep } from '../utils';
import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => ({
  user: state.user,
  cart: state.cart.present,
  query: state.search.query,
  page: state.search.page,
  selectedItemId: state.search.selectedItemId,
  tab: state.app.viewTab,
  categories: state.search.categories,
  results: splitAndMergeSearchWithCart(state.cart.present.items, state.search.results, state.user) || [],
  loading: state.search.loading,
  lazyLoading: state.search.lazyLoading,
  lastUpdatedId: state.search.lastUpdatedId
});

const ONE_SECOND = 1000;

const mapDispatchToProps = dispatch => ({
  toggleHistory: () => sleep(100).then(() => dispatch(toggleHistory())),
  togglePopup: () => dispatch(togglePopup()),
  submitQuery: (query, store, locale) => {
    if (!isUrl(query)) addSearchHistory(query);
    return dispatch(submitQuery(query, store, locale));
  },
  addItem: (cart_id, item_id) => {
    ReactGA.event({
      category: 'Cart',
      action: 'Item Added'
    });
    return dispatch(addItem(cart_id, item_id));
  },
  selectItem: (item_id) => {
    ReactGA.event({
      category: 'Search',
      action: 'Item Selected'
    });
    return dispatch(selectItem(item_id));
  },
  updateItem: (item_id, updatedValues) => dispatch(updateItem(item_id, updatedValues)),
  navigateRightResults: () => dispatch(navigateRightResults()),
  navigateLeftResults: () => dispatch(navigateLeftResults()),
  fetchSearchItem: (item_id) => dispatch(fetchSearchItem(item_id)),
  fetchItemVariation: (option_asin, store, locale) => dispatch(fetchItemVariation(option_asin, store, locale)),
  getMoreSearchResults: (query, store, locale, page) => dispatch(getMoreSearchResults(encodeURIComponent(query), store, locale, page)),
  removeItem: (cart_id, item_id) => dispatch(removeItem(cart_id, item_id)).then(() => setTimeout(() => dispatch(ActionCreators.clearHistory()), 10 * ONE_SECOND)),
  replace: (loc) => dispatch(replace(loc))
});

export default connect(mapStateToProps, mapDispatchToProps)(Results);
