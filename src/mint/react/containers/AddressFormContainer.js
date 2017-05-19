// react/containers/AddressFormContainer.js

import { connect } from 'react-redux';
import { sendAddressData } from '../actions/cart';
import { updateUser } from '../actions/session';
import { AddressForm } from '../components';
import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.currentCart.cart_id,
  user_account: state.session.user_account,
  user_id: state.session.user_account.id
});

const mapDispatchToProps = dispatch => ({
  sendAddressData: (...args) => {
    ReactGA.event({
      category: 'Cart',
      action: 'Added Address',
    });
    return dispatch(sendAddressData(...args));
  },
  sendYPOData: (user_id, ypo_account_number, ypo_account_name, ypo_voucher_code) => {
    ReactGA.event({
      category: 'Cart',
      action: 'Added Address',
    });
    return dispatch(updateUser(user_id, { ypo_account_number, ypo_account_name, ypo_voucher_code }));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(AddressForm);
