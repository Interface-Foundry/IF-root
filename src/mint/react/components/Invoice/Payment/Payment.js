// react/components/Invoice/Invoice.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import PaymentSources from './PaymentSources';
import Stripe from './Stripe';


export default class Payment extends Component {

  static propTypes = {
    invoice: PropTypes.object,
    createPayment: PropTypes.func,
    updateInvoice: PropTypes.func,
    selectAccordion: PropTypes.func,
    selectedAccordion: PropTypes.string
  }

  render() {
  	const { invoice, createPayment, updateInvoice, selectAccordion, selectedAccordion } = this.props;

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
