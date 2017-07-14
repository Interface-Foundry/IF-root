// mint/react/components/View/Invoice/Stripe.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InvoiceOptions from './InvoiceOptions';

export default class InvoiceInfo extends Component {
  static propTypes = {
    cart: PropTypes.object,
    invoice: PropTypes.object,
    selectAccordion: PropTypes.func,
    updateInvoice: PropTypes.func
  }

  render() {

    const { selectAccordion, cart, user, invoice } = this.props;
    //bc sometimes the backend doesn't feel like returning an object
    const isLeader = user.id === cart.leader.id || user.id === cart.leader;

    return (
      <div className='payment accordion'>
        <nav onClick={() => selectAccordion('invoiceinfo')}>
          <div>
            <h3> Invoice Info</h3>
          </div>
            <div>
             {
              (invoice.leader) ? <div>
              <text> leader: {invoice.leader.name ||invoice.leader}, paid: {invoice.paid ? 'paid' : 'not paid'}, status: {invoice.status}, split_type: {invoice.split_type} </text> </div>: <p> not available create one above </p>}
            </div>
        </nav>
      { isLeader ? <InvoiceOptions {...this.props}/> : null }
      </div>
    );
  }
}
