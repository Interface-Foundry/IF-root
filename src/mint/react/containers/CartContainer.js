// react/containers/SettingsContainer.js

import { connect } from 'react-redux';
import { ActionCreators } from 'redux-undo';

import { Cart } from '../components';
import {
  submitQuery,
  editItem,
  removeItem,
  copyItem,
  updateItem,
  togglePopup,
  fetchItem,
  selectCartItem,
  selectTab,
  selectAccordion,
  fetchPaymentStatus
} from '../actions';

import { isUrl, addSearchHistory } from '../utils';

const ONE_SECOND = 1000;

const mapStateToProps = (state, ownProps) => ({
  editId: state.cart.present.editId,
  cart: state.cart.present,
  oldCart: state.cart.past[0],
  query: state.search.query,
  user: state.user,
  invoice: state.payments.invoice && !process.env.NODE_ENV.includes('production'),
  paymentStatus: state.payments.status
});

const mapDispatchToProps = dispatch => ({
  selectTab: (tab) => dispatch(selectTab(tab)),
  selectAccordion: (accordion) => dispatch(selectAccordion(accordion)),
  selectCartItem: item_id => dispatch(selectCartItem(item_id)),
  editItem: item_id => dispatch(editItem(item_id)),
  removeItem: (cart_id, item_id) => {
    dispatch(removeItem(cart_id, item_id));
    // clear history after 10 seconds
    setTimeout(() => dispatch(ActionCreators.clearHistory()), 10 * ONE_SECOND);
  },
  togglePopup: () => dispatch(togglePopup()),
  submitQuery: (query, store, locale) => {
    if (!isUrl(query)) addSearchHistory(query);
    return dispatch(submitQuery(query, store, locale));
  },
  copyItem: (cart_id, item_id) => dispatch(copyItem(cart_id, item_id)),
  fetchItem: (item_id) => dispatch(fetchItem(item_id)),

  updateItem: (item_id, updatedValues) => dispatch(updateItem(item_id, updatedValues)),
  fetchPaymentStatus: (invoice_id) => dispatch(fetchPaymentStatus(invoice_id))
});

export default connect(mapStateToProps, mapDispatchToProps)(Cart);
