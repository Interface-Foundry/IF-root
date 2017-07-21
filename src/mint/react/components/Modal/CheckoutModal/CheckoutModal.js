// react/components/Modal/CheckoutModal/CheckoutModal.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class CheckoutModal extends Component {
  static propTypes = {
    cart: PropTypes.object,
    reorderCart: PropTypes.func,
    createInvoice: PropTypes.func
  }

  _storeCheckout = () => {
    const { cart: { locked, id }, reorderCart } = this.props;
    if (locked) reorderCart(id);
    window.open(`/api/cart/${id}/checkout`);
  }

  _kipCheckout = () => this.props.createInvoice(this.props.cart);

  render = () => {
    const { cart: { store, store_locale } } = this.props;
    return (
      <div className='checkout-modal'>

        <p>Do you have a <b>{store} {store_locale}</b> account?</p>
        <span className='checkout-buttons'>
          <button className='checkout-button' onClick={this._storeCheckout}>
            <p>Yes</p>
            <span>Checkout my cart through {store}</span>
          </button>
          <div className='spacer'/>
          <button className='checkout-button' onClick={this._kipCheckout}>
            <p>No</p>
            <span>Checkout my cart through Kip</span>
          </button>
        </span>
      </div>
    );
  }
}