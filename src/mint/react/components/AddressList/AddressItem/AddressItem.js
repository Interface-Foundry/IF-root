// react/components/AddressList/AddressItem/AddressItem.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class AddressItem extends Component {
  static propTypes = {
    address: PropTypes.object,
    userId: PropTypes.string,
    deleteAddress: PropTypes.func,
    editAddress: PropTypes.func,
    addAddress: PropTypes.func,
    fetchAddresses: PropTypes.func,
    selectAddress: PropTypes.func,
    selectedAddress: PropTypes.string,
    invoiceId: PropTypes.string
  }
  render = () => {
    const { address, userId, selectedAddress, selectAddress, editAddress, deleteAddress, invoiceId } = this.props;
    return (
      <li
        onClick={() => address.id !== selectedAddress ? selectAddress({addressId: address.id, invoiceId}) : null}
        className={address.id === selectedAddress ? 'selected' : ''}
      >
        <div className='circle'/>
        <div className='text'>
          <h4>{address.full_name}</h4>
          <p>{`${address.line_1}, ${address.line_2 ? address.line_2 + ',' : '' } ${address.city}, ${address.region ? address.region + ',' : ''} ${address.code ? address.code + ',' : ''} ${address.country}`}</p>
          <span onClick={() => editAddress({addressId: address.id})}>edit</span>
          <span onClick={() => deleteAddress({addressId: address.id, userId})}>delete</span>
        </div>
    </li>
    );
  }
}