// react/containers/AddressFormContainer.js

import { connect } from 'react-redux';
import { AddressForm } from '../components';
import { addAddress, updateAddress, toggleAddressForm, deleteAddress, selectAddress } from '../actions';

const mapStateToProps = (state, ownProps) => ({
  name: state.user.selectedAddress.full_name,
  addressLine1: state.user.selectedAddress.line_1,
  addressLine2: state.user.selectedAddress.line_2,
  city: state.user.selectedAddress.city,
  region: state.user.selectedAddress.region,
  code: state.user.selectedAddress.code,
  country: state.user.selectedAddress.country,
  addressId: state.user.selectedAddress.id,
  userId: state.user.id
});

const mapDispatchToProps = dispatch => ({
  toggleAddressForm: (show) => dispatch(toggleAddressForm(show)),
  updateAddress: ({ userId, name, addressLine1, addressLine2, city, region, code, country, addressId, phone }) =>
    dispatch(updateAddress({ address_id: addressId, user_account: userId, full_name: name, line_1: addressLine1, line_2: addressLine2, city, region, code, country, phone_number: phone })).then(() => dispatch(toggleAddressForm(false))),
  addAddress: ({ userId, name, addressLine1, addressLine2, city, region, code, country, phone }) =>
    dispatch(addAddress({ user_account: userId, full_name: name, line_1: addressLine1, line_2: addressLine2, city, region, code, country, phone_number: phone })).then(() => dispatch(toggleAddressForm(false)))

});

export default connect(mapStateToProps, mapDispatchToProps)(AddressForm);