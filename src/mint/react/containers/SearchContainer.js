// react/containers/SettingsContainer.js

import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Search } from '../components';
import { updateQuery, toggleHistory, submitQuery } from '../actions';
import { isUrl, addSearchHistory, sleep } from '../utils';

const mapStateToProps = (state, ownProps) => ({
  cart: state.cart.present,
  query: state.search.query,
  results: state.search.results,
  showHistory: state.search.history,
  categories: state.search.categories
});

const mapDispatchToProps = dispatch => ({
toggleHistory: (show) => sleep(100).then(()=>dispatch(toggleHistory(show))),
  updateQuery: (query) => dispatch(updateQuery(query)),
  submitQuery: (query, store, locale) => {
    if (!isUrl(query)) addSearchHistory(query);
    dispatch(push(`?q=${query}`));
    return dispatch(submitQuery(encodeURIComponent(query), store, locale));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Search);
