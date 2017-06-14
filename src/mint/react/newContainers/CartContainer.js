// react/containers/SettingsContainer.js

import { connect } from 'react-redux';
import { Cart } from '../newComponents';
import { toggleHistory, submitQuery, addItem, editItem, removeItem } from '../newActions';
import { isUrl, addSearchHistory } from '../utils';
import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => ({
  editId: state.app.editId,
  cart: state.cart,
  query: state.search.query,
  user: state.user
});

const mapDispatchToProps = dispatch => ({
  toggleHistory: () => dispatch(toggleHistory()),
  editItem: item_id => dispatch(editItem(item_id)),
  removeItem: (cart_id, item_id) => dispatch(removeItem(cart_id, item_id)),
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
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Cart);
