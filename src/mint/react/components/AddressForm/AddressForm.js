// react/components/AddressForm/AddressForm.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Icon } from '../../../react-common/Components';

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
  _updateName = (e) => this.setState({ name: { val: e.target.value, modified: true } })
  _updateLine1 = (e) => this.setState({ line_1: { val: e.target.value, modified: true } })
  _updateLine2 = (e) => this.setState({ line_2: { val: e.target.value, modified: true } })
  _updateCity = (e) => this.setState({ city: { val: e.target.value, modified: true } })
  _updateRegion = (e) => this.setState({ region: { val: e.target.value, modified: true } })
  _updateCode = (e) => this.setState({ code: { val: e.target.value, modified: true } })
  _updateCountry = (e) => this.setState({ country: { val: e.target.value, modified: true } })
  _updateDelieveryMessage = (e) => this.setState({ deliveryMessage: { val: e.target.value, modified: true } })

  // ypo things
  _updateAccountNumber = (e) => this.setState({ accountNumber: { val: e.target.value, modified: true } })
  _updateAccountName = (e) => this.setState({ accountName: { val: e.target.value, modified: true } })
  _updateVoucherCode = (e) => this.setState({ voucherCode: { val: e.target.value, modified: true } })

  _checkout = (e) => {
    e.preventDefault();
    const {
      props: { sendAddressData, sendYPOData, user_id, cart_id, history: { replace } },
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
    sendAddressData(user_id, name.val, line_1.val, line_2.val, city.val, region.val, code.val, country.val, deliveryMessage.val);
    sendYPOData(user_id, accountNumber.val, accountName.val, voucherCode.val);
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
      _checkout,
      props: { cart_id, history: { replace } }
    } = this;
    return (
      <div className='address_overlay'>
        <div className='address_form'>
          <h1>
            <span onClick={()=>replace(`/cart/${cart_id}`)}><Icon icon='Clear'/></span>
            Just a couple more things before we can checkout your cart!
          </h1>
          <form onSubmit={_checkout}>
            <ul>
              <li> 
                <h2>Your YPO Account</h2>
                <ul>
                  <li>
                    <p><input className={this.state.accountName.modified ? '' : 'empty'} onChange={_updateAccountName} placeholder='YPO Account Name' type='text' required autoFocus/></p>
                    <p><label>YPO Account Name</label></p>
                  </li>
                  <li>
                    <p><input className={this.state.accountNumber.modified ? '' : 'empty'} onChange={_updateAccountNumber} placeholder='YPO Account Number' type='number' required/></p>
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
                    <p><input className={this.state.name.modified ? '' : 'empty'} onChange={_updateName} placeholder='Full Name' autoComplete='name' type='text' required/></p>
                    <p><label>Full Name</label></p>
                  </li>
                  <li>
                    <p><input className={this.state.line_1.modified ? '' : 'empty'} onChange={_updateLine1} placeholder='Address Line 1' autoComplete='street-address' type='text'  required/></p>
                    <p><label>Street address, P.O. box, company name, c/o</label></p>
                  </li>
                  <li>
                    <p><input className={this.state.line_2.modified ? '' : 'empty'} onChange={_updateLine2} placeholder='Address Line 2' autoComplete='address-line2' type='text' /></p>
                    <p><label>Apartment, suite, unit, building, floor, etc.</label></p>
                  </li>
                  <li>
                    <p><input className={this.state.city.modified ? '' : 'empty'} onChange={_updateCity} placeholder='City'  type='text' required/></p>
                    <p><label>City</label></p>
                  </li>
                  <li>
                    <p><input className={this.state.region.modified ? '' : 'empty'} onChange={_updateRegion} placeholder='State/Province/Region' type='text' required/></p>
                    <p><label>State/Province/Region</label></p>
                  </li>
                  <li>
                    <p><input className={this.state.code.modified ? '' : 'empty'} onChange={_updateCode} placeholder='Zip/Postal Code' autoComplete='postal-code' type='text' required/></p>
                    <p><label>Zip/Postal Code</label></p>
                  </li>
                  <li>
                    <p><input className={this.state.country.modified ? '' : 'empty'} onChange={_updateCountry} placeholder='Country' autoComplete='country' type='text' required/></p>
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
