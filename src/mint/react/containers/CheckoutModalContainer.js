// react/containers/CheckoutModalContainer.js

import { connect } from 'react-redux';
import { CheckoutModal } from '../components';
import { push } from 'react-router-redux';
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

    dispatch(toggleCheckoutModal(false));
    dispatch(push(`/cart/${cart.id}/m/invoice`));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutModal);