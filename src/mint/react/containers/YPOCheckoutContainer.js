// react/containers/YPOCheckoutContainer.js

import { connect } from 'react-redux';
import { YPOCheckout } from '../components';
import { toggleYpoCheckout } from '../actions/app';
import { updateCart, fetchCarts } from '../actions/cart';

const mapStateToProps = (state, ownProps) => ({
  showYpoCheckout: state.app.showYpoCheckout,
  total: state.cart.present.items.reduce((a, i) => a + i.price, 0),
  locale: state.cart.present.store_locale,
  orderNumber: state.cart.present.order_number,
  accountNumber: state.cart.present.account_number,
  voucherCode: state.cart.present.voucher_code,
  deliveryMessage: state.cart.present.delivery_message,
  cart: state.cart.present,
  leader: state.cart.present.leader,
  userId: state.user.id
});

const mapDispatchToProps = dispatch => ({
  toggleYpoCheckout: (show) => dispatch(toggleYpoCheckout(show)),
  submitYpoData: ({ cart, cartId, orderNumber, accountNumber, voucherCode, deliveryMessage, lock }) =>
    dispatch(updateCart({ ...cart, order_number: orderNumber, account_number: accountNumber, voucher_code: voucherCode, delivery_message: deliveryMessage, locked: lock })).then(() => dispatch(toggleYpoCheckout(false))).then(() => dispatch(fetchCarts()))

});

export default connect(mapStateToProps, mapDispatchToProps)(YPOCheckout);