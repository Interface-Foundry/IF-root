// react/components/AddressList/AddressList.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AddressItem from './AddressItem';

export default class AddressList extends Component {
  static propTypes = {
    addresses: PropTypes.array,
    addAddress: PropTypes.func,
    fetchAddresses: PropTypes.func,
    selectedAddress: PropTypes.string,
    invoiceAddress: PropTypes.string
  }

  componentWillMount = () => this.props.fetchAddresses()

  render = () => {
    const { props: { addresses = [], addAddress, invoiceAddress, selectedAddress }, props } = this;
    return (
      <div>
        <ul>
        {
          addresses.map(addr =>
            <AddressItem {...props} key={addr.id} address={addr} selectedAddress={selectedAddress || invoiceAddress}/>)
        }
        </ul>
        <button onClick={addAddress}>+Add Address</button>
      </div>
    );
  }
}