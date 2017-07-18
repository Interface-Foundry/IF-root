// react/containers/AddressFormContainer.js

import { connect } from 'react-redux';
import { AddressForm } from '../components';
import { toggleAddressForm } from '../actions/app';
import { addAddress, updateAddress } from '../actions';

const mapStateToProps = (state, ownProps) => ({
  total: state.cart.present.items.reduce((a, i) => a + i.price, 0),
  locale: state.cart.present.store_locale,
  name: state.user.selectedAddress.name,
  addressLine1: state.user.selectedAddress.line_1,
  addressLine2: state.user.selectedAddress.line_2,
  city: state.user.selectedAddress.city,
  region: state.user.selectedAddress.region,
  code: state.user.selectedAddress.code,
  country: state.user.selectedAddress.country,
  addressList: state.user.addresses,
  cartId: state.cart.present.id,
  leader: state.cart.present.leader,
  addressId: state.user.selectedAddress.id,
  userId: state.user.id
});

const mapDispatchToProps = dispatch => ({
  toggleAddressForm: (show) => dispatch(toggleAddressForm(show)),
  updateAddress: ({ userId, name, addressLine1, addressLine2, city, region, code, country, addressId }) =>
    dispatch(updateAddress({ address_id: addressId, user_account: userId, full_name: name, line_1: addressLine1, line_2: addressLine2, city, region, code, country })).then(() => dispatch(toggleAddressForm(false))),
  addAddress: ({ userId, name, addressLine1, addressLine2, city, region, code, country }) =>
    dispatch(addAddress({ user_account: userId, full_name: name, line_1: addressLine1, line_2: addressLine2, city, region, code, country })).then(() => dispatch(toggleAddressForm(false)))
});

export default connect(mapStateToProps, mapDispatchToProps)(AddressForm);