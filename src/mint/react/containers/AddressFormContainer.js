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
  submitForm: (user_id, data) => {
    const { ypo_account_number: { val: ypo_account_number }, ypo_account_name: { val: ypo_account_name }, ypo_voucher_code: { val: ypo_voucher_code }, full_name: { val: full_name }, line_1: { val: line_1 }, line_2: { val: line_2 }, city: { val: city }, region: { val: region }, code: { val: code }, country: { val: country }, delivery_message: { val: delivery_message } } = data;
    ReactGA.event({
      category: 'Cart',
      action: 'Added Address'
    });
    dispatch(updateUser(user_id, { ypo_account_number, ypo_account_name, ypo_voucher_code }));
    dispatch(sendAddressData(user_id, full_name, line_1, line_2, city, region, code, country, delivery_message));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(AddressForm);
