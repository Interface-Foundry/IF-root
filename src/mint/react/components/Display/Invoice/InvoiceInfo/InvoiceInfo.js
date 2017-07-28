// mint/react/components/View/Invoice/Stripe.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { displayCost, numberOfItems } from '../../../../utils';

export default class InvoiceInfo extends Component {
  static propTypes = {
    cart: PropTypes.object,
    invoice: PropTypes.object,
    selectAccordion: PropTypes.func,
    updateInvoice: PropTypes.func
  }

  render() {

    const { selectAccordion, cart, invoice } = this.props;

    return (
      <div className='payment accordion items'>
        <nav onClick={() => selectAccordion('invoiceinfo')}>
          <div>
            <h3>Cart Summary</h3>
          </div>
          <table className="invoice-info">
            <tbody>
              <tr>
                <td>Items ({numberOfItems(cart.items)}):</td>
                <td>{displayCost(invoice.total)}</td>
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
                <td><b>{displayCost(invoice.total)}</b></td>
              </tr>
            </tbody>
          </table>
        </nav>
      </div>
    );
  }
}
