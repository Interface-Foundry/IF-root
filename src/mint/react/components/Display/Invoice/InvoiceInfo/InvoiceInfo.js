// mint/react/components/View/Invoice/Stripe.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class InvoiceInfo extends Component {
  static propTypes = {
    cart: PropTypes.object,
    invoice: PropTypes.object,
    selectAccordion: PropTypes.func,
    updateInvoice: PropTypes.func
  }

  render() {

    const { selectAccordion, invoice, cart } = this.props;

    return (
      <div className='payment accordion items'>
        <nav onClick={() => selectAccordion('invoiceinfo')}>
          <div>
            <h3>Cart Summary</h3>
          </div>
          <table className="invoice-info">
            <tr>
              <td>Items ({cart.items.length}):</td>
              <td>${(cart.subtotal / 100).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Shipping & handling:</td>
              <td>$0.00</td>
            </tr>
            <tr>
              <td>Estimated Tax:</td>
              <td>$0.00</td>
            </tr>
            <tr>
              <td></td><td><hr className="separator"/></td>
            </tr>
            <tr>
              <td><b>Total:</b></td>
              <td><b>${(cart.subtotal / 100).toFixed(2)}</b></td>
            </tr>
          </table>
        </nav>
      </div>
    );
  }
}
