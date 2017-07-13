// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { Invoice } from '../components';

import {
  selectAccordion,
  fetchInvoice,
  updateInvoice,
  createPayment,
  fetchPaymentStatus,
  fetchPaymentSources,
  createPaymentSource,
  deletePaymentSource
} from '../actions';

const mapStateToProps = (state, ownProps) => {
  return {
  selectedAccordion: state.app.selectedAccordion,
  cart: state.cart.present,
  user: state.user,
  invoice: state.payments.invoice && !process.env.NODE_ENV.includes('production'),
  paymentSources: state.payments.paymentSources,
  userPaymentStatus: state.payments.userPaymentStatus,
  payment: state.payments.payment
};};

// Just an example for mapping functions to the component.
// What this does it connect the functions to redux, so that the results of those functions get passed to our redux store.
const mapDispatchToProps = dispatch => ({
  selectAccordion: (accordion) => dispatch(selectAccordion(accordion)),
  createPayment: (paymentsource_id, invoice_id) => dispatch(createPayment(paymentsource_id, invoice_id)),
  fetchInvoice: (invoice_id) => dispatch(fetchInvoice(invoice_id)),
  createPaymentSource: (payment_data, payment_source) => dispatch(createPaymentSource(payment_data, payment_source)),
  fetchPaymentSources: (user_id) => dispatch(fetchPaymentSources(user_id)),
  deletePaymentSource: (paymentsource_id) => dispatch(deletePaymentSource(paymentsource_id)),
  updateInvoice: (invoice_id, option, data) => dispatch(updateInvoice(invoice_id, option, data)),
  fetchPaymentStatus: (invoice_id) => dispatch(fetchPaymentStatus(invoice_id))
});


export default connect(mapStateToProps, mapDispatchToProps)(Invoice);




