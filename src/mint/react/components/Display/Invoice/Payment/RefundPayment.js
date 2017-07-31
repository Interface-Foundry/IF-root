// mint/react/components/View/Invoice/Stripe.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class RefundPayment extends Component {

  static propTypes = {
    invoice: PropTypes.object,
    userPaymentStatus: PropTypes.object,
    fetchPaymentStatus: PropTypes.func,
    refundPayment: PropTypes.func
  }

  componentWillMount() {
    const { fetchPaymentStatus, invoice } = this.props;
    console.log({line: 'Refund.js:17'})
    fetchPaymentStatus(invoice.id);
  }

  render() {
    const { invoice, userPaymentStatus, refundPayment } = this.props;
    return (
      <div>
        <p> Thanks for paying ${userPaymentStatus.amount / 100}.</p>
        {
          invoice.refund_ability ? <button onClick={()=> refundPayment(userPaymentStatus.payment_id)}>Refund Payment</button> : 'We can no longer refund this payment'
        }
      </div>
    );
  }
}