// react/containers/SettingsContainer.js

import { connect } from 'react-redux';
import { Search } from '../newComponents';
import { updateQuery, toggleHistory, submitQuery } from '../newActions';
import { isUrl, addSearchHistory } from '../utils';
import { push } from 'react-router-redux';
import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => ({
  cart: state.cart,
  query: state.search.query,
  results: state.search.results,
  history: state.search.history
});

const mapDispatchToProps = dispatch => ({
	toggleHistory: () => dispatch(toggleHistory()), 
  	updateQuery: (query) => dispatch(updateQuery(query)),
  	submitQuery: (query, store, locale) => {
  		if (!isUrl(query)) addSearchHistory(query);
  		return dispatch(submitQuery(query, store, locale))
  	}
});

export default connect(mapStateToProps, mapDispatchToProps)(Search);
