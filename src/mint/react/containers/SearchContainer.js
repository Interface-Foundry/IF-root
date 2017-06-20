// react/containers/SettingsContainer.js

import { connect } from 'react-redux';
import { Search } from '../components';
import { updateQuery, toggleHistory, submitQuery } from '../actions';
import { isUrl, addSearchHistory } from '../utils';

const mapStateToProps = (state, ownProps) => ({
  cart: state.cart.present,
  query: state.search.query,
  results: state.search.results,
  history: state.search.history,
  categories: state.search.categories
});

const mapDispatchToProps = dispatch => ({
  toggleHistory: () => dispatch(toggleHistory()),
  updateQuery: (query) => dispatch(updateQuery(query)),
  submitQuery: (query, store, locale) => {
    if (!isUrl(query)) addSearchHistory(query);
    return dispatch(submitQuery(encodeURIComponent(query), store, locale));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Search);
