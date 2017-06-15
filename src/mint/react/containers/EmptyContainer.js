// react/containers/SettingsContainer.js

import { connect } from 'react-redux';
import { Empty } from '../components';
import { updateQuery, submitQuery } from '../actions';
import { isUrl, addSearchHistory } from '../utils';

const mapStateToProps = (state, ownProps) => ({
  cart: state.cart,
  tab: state.app.viewTab,
  query: state.search.query,
  categories: state.search.categories
});

const mapDispatchToProps = dispatch => ({
  updateQuery: (query) => dispatch(updateQuery(query)),
  submitQuery: (query, store, locale) => {
    if (!isUrl(query)) addSearchHistory(query);
    return dispatch(submitQuery(encodeURIComponent(query), store, locale));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Empty);