import { connect } from 'react-redux';
import { Buttons } from '../components';
import { push } from 'react-router-redux';

import {
  togglePopup,
  updateCart,
  fetchCarts,
  reorderCart,
  selectTab,
  selectAccordion,
  createInvoice,
  toggleYpoCheckout,
  toggleCheckoutModal,
  fetchInvoiceByCart

} from '../actions';

const mapStateToProps = (state, props) => {
  return {
    cart: state.cart.present,
    user: state.user,
    invoice: state.payments.invoice
  };
};

const mapDispatchToProps = dispatch => ({
  _toggleLoginScreen: () => dispatch(togglePopup()),
  reorderCart: (id) => dispatch(reorderCart(id)),
  push: (url) => dispatch(push(url)),
  updateCart: (cart) => dispatch(updateCart(cart)).then(() => dispatch(fetchCarts())),
  selectTab: (tab) => dispatch(selectTab(tab)),
  fetchInvoiceByCart: (cart_id) => dispatch(fetchInvoiceByCart(cart_id)),
  selectAccordion: (accordion) => dispatch(selectAccordion(accordion)),
  createInvoice: (cart_id, invoice_type, split_type) => dispatch(createInvoice(cart_id, invoice_type, split_type)),
  toggleYpoCheckout: (show) => dispatch(toggleYpoCheckout(show)),
  toggleCheckoutModal: (show) => dispatch(toggleCheckoutModal(show))
});

export default connect(mapStateToProps, mapDispatchToProps)(Buttons);