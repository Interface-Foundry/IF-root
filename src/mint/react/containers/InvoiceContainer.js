// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { Invoice } from '../components';

import {
  selectAccordion,
  fetchInvoice,
  fetchInvoiceByCart,
  updateInvoice,
  createPayment,
  refundPayment,
  fetchPaymentStatus,
  fetchPaymentSources,
  createPaymentSource,
  createPaymentWithoutSource,
  deletePaymentSource,
  selectTab
} from '../actions';

const mapStateToProps = (state, ownProps) => {
  return {
    selectedAccordion: state.app.selectedAccordion,
    cart: state.cart.present,
    user: state.user,
    invoice: state.payments.invoice,
    paymentSources: state.payments.paymentSources,
    userPaymentStatus: state.payments.userPaymentStatus,
    payment: state.payments.payment,
    tab: state.app.viewTab
  };
};

// Just an example for mapping functions to the component.
// What this does it connect the functions to redux, so that the results of those functions get passed to our redux store.
const mapDispatchToProps = dispatch => ({
  selectAccordion: (accordion) => dispatch(selectAccordion(accordion)),
  createPayment: (paymentsource_id, invoice_id) => dispatch(createPayment(paymentsource_id, invoice_id)),
  refundPayment: (payment_id) => dispatch(refundPayment(payment_id)),
  fetchInvoice: (invoice_id) => dispatch(fetchInvoice(invoice_id)),
  fetchInvoiceByCart: (cart_id) => dispatch(fetchInvoiceByCart(cart_id)),
  createPaymentSource: (payment_amount, payment_data, payment_source, invoice_id) => dispatch(createPaymentSource(payment_amount, payment_data, payment_source, invoice_id)),
  createPaymentWithoutSource: (payment_amount, payment_data, payment_source, invoice_id) => dispatch(createPaymentWithoutSource(payment_amount, payment_data, payment_source, invoice_id)),
  fetchPaymentSources: (user_id) => dispatch(fetchPaymentSources(user_id)),
  deletePaymentSource: (paymentsource_id) => dispatch(deletePaymentSource(paymentsource_id)),
  updateInvoice: (invoice_id, option, data) => dispatch(updateInvoice(invoice_id, option, data)),
  fetchPaymentStatus: (invoice_id) => dispatch(fetchPaymentStatus(invoice_id)),
  setTab: () => dispatch(selectTab('invoice')),
  closeTab: () => dispatch(selectTab('cart'))
});

export default connect(mapStateToProps, mapDispatchToProps)(Invoice);