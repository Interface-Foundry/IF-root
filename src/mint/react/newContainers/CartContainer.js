// react/containers/SettingsContainer.js

import { connect } from 'react-redux';
import { Cart } from '../newComponents';
import { submitQuery, editItem, removeItem, copyItem, updateItem, togglePopup } from '../newActions';
import { isUrl, addSearchHistory } from '../utils';
import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => ({
  editId: state.app.editId,
  cart: state.cart,
  query: state.search.query,
  user: state.user
});

const mapDispatchToProps = dispatch => ({
  editItem: item_id => dispatch(editItem(item_id)),
  removeItem: (cart_id, item_id) => dispatch(removeItem(cart_id, item_id)),
  togglePopup: () => dispatch(togglePopup()),
  submitQuery: (query, store, locale) => {
    if (!isUrl(query)) addSearchHistory(query);
    return dispatch(submitQuery(query, store, locale));
  },
  copyItem: (cart_id, item_id) => dispatch(copyItem(cart_id, item_id)),
  updateItem: (item_id, updatedValues) => dispatch(updateItem(item_id, updatedValues))
});

export default connect(mapStateToProps, mapDispatchToProps)(Cart);
