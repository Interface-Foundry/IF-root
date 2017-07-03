// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { Invoice } from '../components';

import {
  selectAccordion,
  fetchInvoice,
  fetchInvoices,
  createInvoice,
  fetchLatestInvoiceForCart,
  fetchPaymentSources,
  createPaymentSource,
  deletePaymentSource,
  updateInvoiceOptions
} from '../actions';

const mapStateToProps = (state, ownProps) => {
  return {
  selectedAccordion: state.app.selectedAccordion,
  cart: state.cart.present,
  user: state.user,
  invoice: state.payments.invoice,
  paymentSources: state.payments.paymentSources
};};

// Just an example for mapping functions to the component.
// What this does it connect the functions to redux, so that the results of those functions get passed to our redux store.
const mapDispatchToProps = dispatch => ({
  selectAccordion: (accordion) => dispatch(selectAccordion(accordion)),
  fetchInvoices: (invoice_id) => dispatch(fetchInvoices(invoice_id)),
  fetchLatestInvoiceForCart: (cart_id) => dispatch(fetchLatestInvoiceForCart(cart_id)),
  createInvoice: (cart_id, invoice_type) => dispatch(createInvoice(cart_id, invoice_type)),
  fetchInvoice: (invoice_id) => dispatch(fetchInvoice(invoice_id)),
  createPaymentSource: (payment_data, payment_source) => dispatch(createPaymentSource(payment_data, payment_source)),
  fetchPaymentSources: (user_id) => dispatch(fetchPaymentSources(user_id)),
  deletePaymentSource: (paymentsource_id) => dispatch(deletePaymentSource(paymentsource_id)),
  updateInvoiceOptions: (invoice_id, option, data) => dispatch(updateInvoiceOptions(invoice_id, option, data))
});


export default connect(mapStateToProps, mapDispatchToProps)(Invoice);




