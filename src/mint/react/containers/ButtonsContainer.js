import { connect } from 'react-redux';
import { Buttons } from '../components';
import { push, replace } from 'react-router-redux';

import {
  togglePopup,
  updateCart,
  reorderCart,
  selectTab,
  selectAccordion,
  createInvoice,
  toggleYpoCheckout,
  fetchInvoiceByCart,
  toggleReward
} from '../actions';

const mapStateToProps = (state, props) => {
  return {
    cart: state.cart.present,
    user: state.user,
    tab: state.app.viewTab,
    invoice: state.payments.invoice
  };
};

const mapDispatchToProps = dispatch => ({
  _toggleLoginScreen: () => dispatch(togglePopup()),
  reorderCart: (id) => dispatch(reorderCart(id)),
  push: (url) => dispatch(push(url)),
  updateCart: (cart) => dispatch(updateCart(cart)),
  selectTab: (tab) => dispatch(selectTab(tab)),
  fetchInvoiceByCart: (cart_id) => dispatch(fetchInvoiceByCart(cart_id)),
  selectAccordion: (accordion) => dispatch(selectAccordion(accordion)),
  createInvoice: (cart_id, invoice_type, split_type) => dispatch(createInvoice(cart_id, invoice_type, split_type)),
  toggleYpoCheckout: (show) => dispatch(toggleYpoCheckout(show)),
  toggleReward: () => {
    dispatch(toggleReward())
    dispatch(replace(`${location.pathname}?toast=Purchase Successful&status=success`))
    setTimeout(() => {
      dispatch(toggleReward())
    }, 2000);
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Buttons);
