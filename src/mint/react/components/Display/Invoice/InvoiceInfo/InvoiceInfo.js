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

    const { selectAccordion, invoice } = this.props;

    return (
      <div className='payment accordion'>
        <nav onClick={() => selectAccordion('invoiceinfo')}>
          <div>
            <h3> Invoice Info - Note: Adding Flat $10.00 Kip Fee to All orders for time being</h3>
          </div>
            <div>
             {
              (invoice.leader) ? <div>
              <text> leader: {invoice.leader.name ||invoice.leader}, paid: {invoice.paid ? 'paid' : 'not paid'}, status: {invoice.status}, split_type: {invoice.split_type} </text> </div>: <p> not available create one above </p>}
            </div>
        </nav>
      </div>
    );
  }
}