// react/components/Invoice/Invoice.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Stripe from './Stripe';
import PaymentSources from './PaymentSources';


// deciding a split type seems almost political/philosophical
const splitTypes = [{
  type: 'split_single',
  text: 'single payer'
}, {
  type: 'split_equal',
  text: 'split equally amongst the people of kip!'
}, {
  type: 'split_by_item',
  text: 'split by item'
}]

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
