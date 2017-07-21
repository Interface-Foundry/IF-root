// react/components/Modal/AddressForm/AddressForm.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '../../../../react-common/components';

export default class AddressForm extends Component {
  static propTypes = {
    locale: PropTypes.string,
    name: PropTypes.string,
    addressLine1: PropTypes.string,
    addressLine2: PropTypes.string,
    city: PropTypes.string,
    region: PropTypes.string,
    code: PropTypes.string,
    country: PropTypes.string,
    addressList: PropTypes.array,
    cartId: PropTypes.string,
    leader: PropTypes.object,
    phone: PropTypes.string,
    addressId: PropTypes.string,
    userId: PropTypes.string,
    toggleAddressForm: PropTypes.func,
    addAddress: PropTypes.func,
    updateAddress: PropTypes.func
  }

  state = {
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    region: '',
    code: '',
    country: '',
    phone: ''
  }

  _updateName = e => this.setState({ name: e.target.value })
  _updateLine1 = e => this.setState({ addressLine1: e.target.value })
  _updateLine2 = e => this.setState({ addressLine2: e.target.value })
  _updateCity = e => this.setState({ city: e.target.value })
  _updateRegion = e => this.setState({ region: e.target.value })
  _updateCode = e => this.setState({ code: e.target.value })
  _updateCountry = e => this.setState({ country: e.target.value })
  _updatePhone = e => this.setState({ phone: e.target.value })

  _saveAddress = e => {
    const { state: { name, addressLine1, addressLine2, city, region, code, country, phone }, props: { userId, addAddress } } = this;
    addAddress({ name, addressLine1, addressLine2, city, region, code, country, phone, userId });
  }

  _updateAddress = e => {
    const { state: { name, addressLine1, addressLine2, city, region, code, country, phone }, props: { userId, updateAddress, addressId } } = this;
    updateAddress({ name, addressLine1, addressLine2, city, region, code, country, phone, userId, addressId });
  }
  componentWillReceiveProps = ({ name = '', addressLine1 = '', addressLine2 = '', city = '', region = '', code = '', country = '', phone = '' }) =>
    this.setState({ name, addressLine1, addressLine2, city, region, code, country, phone });

  componentDidMount = () => {
    const { name = '', addressLine1 = '', addressLine2 = '', city = '', region = '', code = '', country = '', phone = '' } = this.props;
    this.setState({ name, addressLine1, addressLine2, city, region, code, country, phone });
  }

  _handleSubmit = e => {
    const { _updateAddress, _saveAddress, props: { addressId } } = this;
    e.preventDefault();
    addressId ? _updateAddress() : _saveAddress();
  }

  render = () =>
    <div className='address-form form-container'>
      <h1>{this.props.addressId ? 'Update' : 'Add'} an Address</h1>
      <p>Enter your information Below</p>
      <form onSubmit={this._handleSubmit}>
        <label>
          <div>
            Name <i>Required</i>
          </div>
          <span>
            <Icon icon='Member'/>
            <input type='text' placeholder='Your Name' required value={this.state.name} onChange={this._updateName} />
            <span className='required'>﹡</span>
          </span>
        </label>
        <label>
          <div>
            Address line 1 <i>Required</i>
          </div>
          <span>
            <Icon icon='Member'/>
            <input type='text' placeholder='Street Address' required value={this.state.addressLine1} onChange={this._updateLine1} />
            <span className='required'>﹡</span>
          </span>
        </label>
        <label>
          <div>
            Address Line 2
          </div>
          <span>
            <Icon icon='Member'/>
            <input type='text' placeholder='Apartment Number, PO Box, etc' value={this.state.addressLine2} onChange={this._updateLine2} />
          </span>
        </label>
        <label>
          <div>
            City <i>Required</i>
          </div>
          <span>
            <Icon icon='Member'/>
            <input type='text' placeholder='City' required value={this.state.city} onChange={this._updateCity} />
            <span className='required'>﹡</span>
          </span>
        </label>
        <label>
          <div>
            State/Province/Region
          </div>
          <span>
            <Icon icon='Member'/>
            <input type='text' placeholder='State/Province/Region' value={this.state.region} onChange={this._updateRegion} />
          </span>
        </label>
        <label>
          <div>
            ZIP Code
          </div>
          <span>
            <Icon icon='Member'/>
            <input type='number' placeholder='ZIP Code' value={this.state.code} onChange={this._updateCode} />
          </span>
        </label>
        <label>
          <div>
            Country <i>Required</i>
          </div>
          <span>
            <Icon icon='Member'/>
            <input type='text' placeholder='Country' required value={this.state.country} onChange={this._updateCountry} />
            <span className='required'>﹡</span>
          </span>
        </label>
        <label>
          <div>
            Phone Number <i>Required</i>
          </div>
          <span>
            <Icon icon='Member'/>
            <input type='tel' placeholder='Phone Number' required value={this.state.phone} onChange={this._updatePhone} />
            <span className='required'>﹡</span>
          </span>
        </label>
        {
          this.props.addressId
          ? <button className='update-button' type='submit'>Update Address</button>
          : <button className='save-button' type='submit'>Save Address</button>
        }
      </form>
    </div>
}