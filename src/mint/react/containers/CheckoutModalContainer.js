// react/containers/CheckoutModalContainer.js

import { connect } from 'react-redux';
import { CheckoutModal } from '../components';
import { toggleCheckoutModal, reorderCart, createInvoice, selectTab } from '../actions';

const mapStateToProps = (state, ownProps) => ({
  cart: state.cart.present,
  user: state.user
});

const mapDispatchToProps = dispatch => ({
  toggleCheckoutModal: (show) => dispatch(toggleCheckoutModal(show)),
  reorderCart: (id) => {
    dispatch(reorderCart(id));
    dispatch(toggleCheckoutModal(false));
  },
  createInvoice: (cart) => {
    dispatch(createInvoice(cart.id, 'mint', 'split_by_item'));
    dispatch(selectTab('invoice'));
    dispatch(toggleCheckoutModal(false));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutModal);