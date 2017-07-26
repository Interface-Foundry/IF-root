// react/containers/ItemPaidButtonContainer.js

import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { ItemPaidButton } from '../components';
import { selectTab, selectAccordion } from '../actions';

const mapStateToProps = (state, ownProps) => ({
  user: state.user,
  cart: state.cart.present,
  paid: state.payments.userPaymentStatus.paid
});

const mapDispatchToProps = dispatch => ({
  goToInvoice: (cart_id) => {
    dispatch(push(`/cart/${cart_id}/m/invoice`));
    dispatch(selectTab('invoice'));
  },
  selectAccordion: (accordion) => dispatch(selectAccordion(accordion))
});

export default connect(mapStateToProps, mapDispatchToProps)(ItemPaidButton);