// react/components/AddressList/AddressList.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class AddressList extends Component {
  static propTypes = {
    addresses: PropTypes.array,
    userId: PropTypes.string,
    deleteAddress: PropTypes.func,
    editAddress: PropTypes.func,
    addAddress: PropTypes.func,
    fetchAddresses: PropTypes.func
  }

  componentWillMount = () => this.props.fetchAddresses()

  render = () => {
    const { addresses = [], editAddress, deleteAddress, addAddress, userId } = this.props;
    return (
      <div>
        <ul>
        {
          addresses.map((address, i) => (
              <li key={i}>
                  <div className='circle'/>
                  <div className='text'>
                      <h4>{address.full_name}</h4>
                      <p>{address.line_1}, {address.line_2}, {address.city}, {address.region}, {address.code}, {address.country}</p>
                      <span onClick={()=>editAddress({addressId: address.id})}>edit</span>
                      {/*<span onClick={()=>deleteAddress({addressId: address.id, userId})}>delete</span>*/}
                  </div>
              </li>
          ))
        }
        </ul>
        <button onClick={addAddress}>+Add Address!</button>
      </div>
    );
  }
}