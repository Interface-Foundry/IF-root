// react/components/AddressList/AddressList.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class AddressList extends Component {
  static propTypes = {
    addresses: PropTypes.array,
    addAddress: PropTypes.func,
    fetchAddresses: PropTypes.func,
    selectedAddress: PropTypes.string
  }

  componentWillMount = () => this.props.fetchAddresses()

  render = () => {
    const { props: { addresses = [], addAddress, selectedAddress = '' }, props } = this;
    return (
      <div>
        <ul>
        { addresses.map(addr => <AddressItem {...props} key={addr.id} address={addr} selectedAddress={selectedAddress}/>) }
        </ul>
        <button onClick={addAddress}>+Add Address</button>
      </div>
    );
  }
}

class AddressItem extends Component {
  static propTypes = {
    address: PropTypes.object,
    userId: PropTypes.string,
    deleteAddress: PropTypes.func,
    editAddress: PropTypes.func,
    addAddress: PropTypes.func,
    fetchAddresses: PropTypes.func,
    selectAddress: PropTypes.func,
    selectedAddress: PropTypes.string
  }
  render = () => {
    const { address, userId, selectedAddress, selectAddress, editAddress, deleteAddress } = this.props;
    return (
      <li
        onClick={() => selectAddress({addressId: address.id})}
        className={address.id === selectedAddress ? 'selected' : ''}
      >
        <div className='circle'/>
        <div className='text'>
          <h4>{address.full_name}</h4>
          <p>{`${address.line_1}, ${address.line_2 ? address.line_2 + ',' : '' } ${address.city}, ${address.region ? address.region + ',' : ''} ${address.code ? address.code + ',' : ''} ${address.country}`}</p>
          <span onClick={()=>editAddress({addressId: address.id})}>edit</span>
          <span onClick={()=>deleteAddress({addressId: address.id, userId})}>delete</span>
        </div>
    </li>
    );
  }
}