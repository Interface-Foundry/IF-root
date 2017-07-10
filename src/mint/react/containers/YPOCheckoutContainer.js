// react/containers/YPOCheckoutContainer.js

import { connect } from 'react-redux';
import { YPOCheckout } from '../components';
import { toggleYpoCheckout } from '../actions/app';
import { updateCart } from '../actions/cart';

const mapStateToProps = (state, ownProps) => ({
  showYpoCheckout: state.app.showYpoCheckout,
  total: state.cart.present.items.reduce((a, i) => a + i.price, 0),
  locale: state.cart.present.store_locale,
  orderNumber: state.cart.present.order_number,
  accountNumber: state.cart.present.account_number,
  voucherCode: state.cart.present.voucher_code,
  deliveryMessage: state.cart.present.delivery_message,
  cartId: state.cart.present.id
});

const mapDispatchToProps = dispatch => ({
  toggleYpoCheckout: (show) => dispatch(toggleYpoCheckout(show)),
  submitYpoData: ({ cartId, orderNumber, accountNumber, voucherCode, deliveryMessage }) =>
    dispatch(updateCart({ id: cartId, order_number: orderNumber, account_number: accountNumber, voucher_code: voucherCode, delivery_message: deliveryMessage, locked: true })).then(() => dispatch(toggleYpoCheckout(false)))
});

export default connect(mapStateToProps, mapDispatchToProps)(YPOCheckout);
