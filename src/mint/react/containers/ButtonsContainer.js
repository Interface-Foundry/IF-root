import { connect } from 'react-redux';
import { Buttons } from '../components';
import { push } from 'react-router-redux';

import {
  togglePopup,
  updateCart,
  reorderCart,
  selectTab,
  selectAccordion,
  createInvoice,
  toggleYpoCheckout
} from '../actions';

const mapStateToProps = (state, props) => {
  return {
    cart: state.cart.present,
    user: state.user,
    invoice: state.payments.invoice && !process.env.NODE_ENV.includes('production')
  };
};

const mapDispatchToProps = dispatch => ({
  _toggleLoginScreen: () => dispatch(togglePopup()),
  reorderCart: (id) => dispatch(reorderCart(id)),
  push: (url) => dispatch(push(url)),
  updateCart: (cart) => dispatch(updateCart(cart)),
  selectTab: (tab) => dispatch(selectTab(tab)),
  selectAccordion: (accordion) => dispatch(selectAccordion(accordion)),
  createInvoice: (cart_id, invoice_type, split_type) => dispatch(createInvoice(cart_id, invoice_type, split_type)),
  toggleYpoCheckout: (show) => dispatch(toggleYpoCheckout(show))
});

export default connect(mapStateToProps, mapDispatchToProps)(Buttons);
