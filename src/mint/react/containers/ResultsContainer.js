// react/containers/SettingsContainer.js

import { connect } from 'react-redux';
import { Results } from '../components';
import { toggleHistory, submitQuery, addItem, selectItem, togglePopup, updateItem } from '../actions';
import { isUrl, addSearchHistory } from '../utils';
import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => ({
  user: state.user,
  cart: state.cart,
  query: state.search.query,
  selectedItemId: state.search.selectedItemId,
  tab: state.app.viewTab,
  categories: state.search.categories,
  results: state.search.results
});

const mapDispatchToProps = dispatch => ({
  toggleHistory: () => dispatch(toggleHistory()),
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
  updateItem: (item_id, updatedValues) => dispatch(updateItem(item_id, updatedValues))
});

export default connect(mapStateToProps, mapDispatchToProps)(Results);