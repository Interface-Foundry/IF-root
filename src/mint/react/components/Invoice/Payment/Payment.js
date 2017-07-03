// react/components/Invoice/Invoice.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Stripe from './Stripe';
import PaymentSources from './PaymentSources';
import PaymentTypes from './PaymentTypes';


export default class Payment extends Component {

  render() {
  	const { selectedAccordion, selectAccordion } = this.props;

    return (
      <div className='payment accordion'>
        <nav onClick={() => selectAccordion('payment')}>
          <h3>2. Payment method</h3>
        </nav>
        {
          selectedAccordion.includes('payment') ? <div>
            <PaymentTypes {...this.props}/>
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
