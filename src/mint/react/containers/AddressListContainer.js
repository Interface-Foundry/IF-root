// react/containers/AddressListContainer.js

import { connect } from 'react-redux';
import { AddressList } from '../components';
import { deleteAddress, selectAddress, toggleAddressForm, fetchAddresses, clearSelectedAddress } from '../actions';

const mapStateToProps = (state, ownProps) => ({
  addresses: state.user.addresses,
  selectedAddress: state.user.selectedAddress ? state.user.selectedAddress.id : null,
  invoiceId: state.payments.invoice.id,
  invoiceAddress: state.payments.invoice.address ? state.payments.invoice.address.id : '',
  userId: state.user.id
});

const mapDispatchToProps = dispatch => ({
  deleteAddress: ({ userId, addressId }) => dispatch(deleteAddress({ user_id: userId, address_id: addressId })),
  editAddress: ({ addressId }) => dispatch(toggleAddressForm(true)),
  addAddress: () => {
    dispatch(clearSelectedAddress());
    dispatch(toggleAddressForm(true));
  },
  fetchAddresses: () => dispatch(fetchAddresses()),
  selectAddress: ({ address, invoiceId }) => dispatch(selectAddress({ address, invoiceId }))
});

export default connect(mapStateToProps, mapDispatchToProps)(AddressList);