// react/components/Invoice/Invoice.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Stripe from './Stripe';
import PaymentSources from './PaymentSources';
import PaymentTypes from './PaymentTypes';


export default class Payment extends Component {

  render() {
  	const { selectedAccordion, updateInvoice, invoice, selectAccordion, createPayments } = this.props;

    return (
      <div className='payment accordion'>
        <nav onClick={() => selectAccordion('payment')}>
          <h3>2. Payment method</h3>
        </nav>
        {
          selectedAccordion.includes('payment') ? <div>
            <nav>
              <h3> create payment objects </h3>
            </nav>
              <div>
                <button onClick={()=> createPayments(invoice.id)}>create payments for users</button>
              </div>
            <nav>
              <h3>update the invoice</h3>
            </nav>
              <div>
                <button onClick={()=> updateInvoice(invoice.id, 'split_type', 'split_single')}>single payer</button>
              </div>
              <div>
                <button onClick={()=> updateInvoice(invoice.id, 'split_type', 'split_equal')}>split equally</button>
              </div>
              <div>
                <button onClick={()=> updateInvoice(invoice.id, 'split_type', 'split_by_item')}>split by item</button>
              </div>
            <nav>
              <h4>Your credit and debit cards</h4>
            </nav>
            <ul>
              <PaymentSources {...this.props}/>
              <Stripe {...this.props}/>
            </ul>
         </div> : null
        }
      </div>
    );
  }
}
