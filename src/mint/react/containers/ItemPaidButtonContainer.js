// react/containers/ItemPaidButtonContainer.js

import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { ItemPaidButton } from '../components';
import { selectTab, selectAccordion } from '../actions';

const mapStateToProps = (state, ownProps) => ({
  user: state.user,
  cart: state.cart.present,
  displayInvoice: state.payments.invoice.display,
  userPaid: state.payments.invoice.display && state.payments.userPaymentStatus.paid,
  splitType: state.payments.invoice.display ? state.payments.invoice.split_type : null,
  isLeader: state.payments.invoice.display && state.payments.invoice.leader.id === state.user.id
});

const mapDispatchToProps = dispatch => ({
  goToInvoice: (cart_id) => {
    dispatch(push(`/cart/${cart_id}/m/invoice`));
    dispatch(selectTab('invoice'));
  },
  selectAccordion: (accordion) => dispatch(selectAccordion(accordion))
});

export default connect(mapStateToProps, mapDispatchToProps)(ItemPaidButton);