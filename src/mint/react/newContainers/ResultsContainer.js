// react/containers/SettingsContainer.js

import { connect } from 'react-redux';
import { Results } from '../newComponents';
import { toggleHistory, submitQuery, addItem } from '../newActions';
import { isUrl, addSearchHistory } from '../utils';
import { push } from 'react-router-redux';
import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => ({
  cart: state.cart,
  query: state.search.query,
  results: state.search.results
});

const mapDispatchToProps = dispatch => ({
	toggleHistory: () => dispatch(toggleHistory()), 
	submitQuery: (query, store, locale) => {
		if (!isUrl(query)) addSearchHistory(query);
		return dispatch(submitQuery(query, store, locale))
	},
	addItem: (cart_id, item_id) => {
    ReactGA.event({
      category: 'Cart',
      action: 'Item Added',
    });
    return dispatch(addItem(cart_id, item_id))
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(Results);
