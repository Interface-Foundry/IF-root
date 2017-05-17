// react/components/AddressForm/AddressForm.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class AddressForm extends Component {
  state = {
    name: '',
    line_1: '',
    line_2: '',
    city: '',
    region: '',
    code: '',
    country: '',
    deliveryMessage: '',
    accountNumber: '',
    accountName: '',
    voucherCode: ''
  }

  static propTypes = {
    sendAddressData: PropTypes.func,
    sendYPOData: PropTypes.func,
    history: PropTypes.object,
    user_id: PropTypes.string,
    cart_id: PropTypes.string
  }

  // address things
  _updateName = (e) => this.setState({ name: e.target.value })
  _updateLine1 = (e) => this.setState({ line_1: e.target.value })
  _updateLine2 = (e) => this.setState({ line_2: e.target.value })
  _updateCity = (e) => this.setState({ city: e.target.value })
  _updateRegion = (e) => this.setState({ region: e.target.value })
  _updateCode = (e) => this.setState({ code: e.target.value })
  _updateCountry = (e) => this.setState({ country: e.target.value })
  _updateDelieveryMessage = (e) => this.setState({ deliveryMessage: e.target.value })

  // ypo things
  _updateAccountNumber = (e) => this.setState({ accountNumber: e.target.value })
  _updateAccountName = (e) => this.setState({ accountName: e.target.value })
  _updateVoucherCode = (e) => this.setState({ voucherCode: e.target.value })

  _checkout = (e) => {
    e.preventDefault();
    const {
      props: { sendAddressData, sendYPOData, user_id, cart_id, history: {replace} },
      state: {
        name,
        line_1,
        line_2,
        city,
        region,
        code,
        country,
        deliveryMessage,
        accountName,
        accountNumber,
        voucherCode
      }
    } = this;
    sendAddressData(user_id, name, line_1, line_2, city, region, code, country, deliveryMessage);
    sendYPOData(user_id, accountNumber, accountName, voucherCode);
    replace(`/cart/${cart_id}`);
    window.open(`/api/cart/${cart_id}/checkout`); // ¯\_(ツ)_/¯
  }
  render() {
    const {
      _updateName,
      _updateLine1,
      _updateLine2,
      _updateCity,
      _updateRegion,
      _updateCode,
      _updateCountry,
      _updateDelieveryMessage,
      _updateAccountName,
      _updateAccountNumber,
      _updateVoucherCode,
      _checkout
    } = this;
    return (
      <div className='checkout_overlay'>
        <div className='add_to_amazon'>
          <h1>Just a couple more things before we can checkout your cart!</h1>
          <form onSubmit={_checkout}>
            <ul>
              <li> 
                <h2>Your YPO Account</h2>
                <ul>
                  <li>
                    <p><input onChange={_updateAccountName} placeholder='YPO Account Name' type='text' required autoFocus/></p>
                    <p><label>YPO Account Name</label></p>
                  </li>
                  <li>
                    <p><input onChange={_updateAccountNumber} placeholder='YPO Account Number' type='number' required/></p>
                    <p><label>YPO Account Number</label></p>
                  </li>
                  <li>
                    <p><input onChange={_updateVoucherCode} placeholder='YPO Voucher Code' type='text'/></p>
                    <p><label>YPO Account Name</label></p>
                  </li>
                </ul>
              </li>
              <li> 
                <h2>Your Address</h2>
                <ul>
                  <li>
                    <p><input onChange={_updateName} placeholder='Full Name' autoComplete='name' type='text' required/></p>
                    <p><label>Full Name</label></p>
                  </li>
                  <li>
                    <p><input onChange={_updateLine1} placeholder='Address Line 1' autoComplete='street-address' type='text'  required/></p>
                    <p><label>Street address, P.O. box, company name, c/o</label></p>
                  </li>
                  <li>
                    <p><input onChange={_updateLine2} placeholder='Address Line 2' autoComplete='address-line2' type='text' /></p>
                    <p><label>Apartment, suite, unit, building, floor, etc.</label></p>
                  </li>
                  <li>
                    <p><input onChange={_updateCity} placeholder='City'  type='text' required/></p>
                    <p><label>City</label></p>
                  </li>
                  <li>
                    <p><input onChange={_updateRegion} placeholder='State/Province/Region' type='text' required/></p>
                    <p><label>State/Province/Region</label></p>
                  </li>
                  <li>
                    <p><input onChange={_updateCode} placeholder='Zip/Postal Code' autoComplete='postal-code' type='text' required/></p>
                    <p><label>Zip/Postal Code</label></p>
                  </li>
                  <li>
                    <p><input onChange={_updateCountry} placeholder='Country' autoComplete='country' type='text' required/></p>
                    <p><label>Country</label></p>
                  </li>
                  <li>
                    <p><input onChange={_updateDelieveryMessage} placeholder='Delievery Message' type='text'/></p>
                    <p><label>Delievery Message</label></p>
                  </li>
                  <li>
                    <button type='submit'><h4>Checkout</h4></button>
                  </li>
                </ul>
              </li>
            </ul>
          </form>
        </div>
      </div>
    );
  }
}
