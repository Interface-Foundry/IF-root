// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { Invoice } from '../components';

import {
  selectAccordion,
  fetchInvoices,
  createInvoice,
  fetchInvoice,
  fetchPaymentSources,
  createPaymentSource,
  deletePaymentSource
} from '../actions';

const mapStateToProps = (state, ownProps) => {
  return {
  selectedAccordion: state.app.selectedAccordion,
  cart: state.cart.present,
  user: state.user,
  paymentSources: state.payments.paymentSources
}};

// Just an example for mapping functions to the component.
// What this does it connect the functions to redux, so that the results of those functions get passed to our redux store.
const mapDispatchToProps = dispatch => ({
  selectAccordion: (accordion) => dispatch(selectAccordion(accordion)),
  fetchInvoices: (cart_id) => dispatch(fetchInvoices(cart_id)),
  createInvoice: (cart_id, invoice_type) => dispatch(createInvoice(cart_id, invoice_type)),
  fetchInvoice: (invoice_id) => dispatch(fetchInvoice(invoice_id)),
  createPaymentSource: (payment_data, payment_source) => dispatch(createPaymentSource(payment_data, payment_source)),
  fetchPaymentSources: (user_id) => dispatch(fetchPaymentSources(user_id)),
  deletePaymentSource: (paymentsource_id) => dispatch(deletePaymentSource(paymentsource_id))
});


export default connect(mapStateToProps, mapDispatchToProps)(Invoice);




