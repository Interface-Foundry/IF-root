// react/containers/AddressListContainer.js

import { connect } from 'react-redux';
import { AddressList } from '../components';
import { deleteAddress, selectAddress, toggleAddressForm, fetchAddresses } from '../actions';

const mapStateToProps = (state, ownProps) => ({
  addresses: state.user.addresses,
  userId: state.user.id
});

const mapDispatchToProps = dispatch => ({
  deleteAddress: ({ userId, addressId }) => dispatch(deleteAddress({ user_id: userId, address_id: addressId })),
  editAddress: ({ addressId }) => {
    dispatch(selectAddress({ selectedAddressId: addressId }));
    dispatch(toggleAddressForm(true));
  },
  addAddress: () => dispatch(toggleAddressForm(true)),
  fetchAddresses: () => dispatch(fetchAddresses()),
  selectAddress: ({ addressId }) => dispatch(selectAddress({ selectedAddressId: addressId }))
});

export default connect(mapStateToProps, mapDispatchToProps)(AddressList);