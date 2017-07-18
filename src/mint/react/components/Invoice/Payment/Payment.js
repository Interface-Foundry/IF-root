// react/components/Invoice/Invoice.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import PaymentSources from './PaymentSources';
import Stripe from './Stripe';

export default class Payment extends Component {

  static propTypes = {
    createPayment: PropTypes.func,
    updateInvoice: PropTypes.func,
    selectAccordion: PropTypes.func,
    fetchPaymentStatus: PropTypes.func,
    selectedAccordion: PropTypes.string
  }

  render() {
    const { userPaymentStatus, selectAccordion, selectedAccordion } = this.props;
    return (
      <div className='payment accordion'>
        <nav onClick={() => selectAccordion('payment')}>
          <h3>Payment</h3>
        </nav>
      </div>
    );
  }
}
