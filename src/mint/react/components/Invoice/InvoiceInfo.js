// mint/react/components/View/Invoice/Stripe.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

export default class InvoiceInfo extends Component {
  static propTypes = {
    cart: PropTypes.object,
    invoice: PropTypes.object,
    selectAccordion: PropTypes.func,
    updateInvoice: PropTypes.func
  }

  render() {

    const { selectedAccordion, selectAccordion, cart, invoice, updateInvoice } = this.props;
    let invoiceAvailable = false;
    if (invoice !== undefined) {
      invoiceAvailable = true;
    }

    return (
      <div className='payment accordion'>
        <nav onClick={() => selectAccordion('invoiceinfo')}>
          <div>
            <h3> Invoice Info</h3>
          </div>
                      <nav>
              <h3>using this invoice:</h3>
            </nav>
            <div>
             {invoiceAvailable ?
              <text> leader: {invoice.leader.name}, paid: {invoice.paid ? 'paid' : 'not paid'}, status: {invoice.status}, split_type: {invoice.split_type} </text> : <p> not available create one above </p>}
            </div>
        </nav>
      </div>
    );
  }
}