// mint/react/components/View/Invoice/Stripe.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Stripe extends Component {

  static propTypes = {
    invoice: PropTypes.object,
    user: PropTypes.object,
    fetchPaymentSources: PropTypes.func
  }

  render() {
    const { user, fetchPaymentSources } = this.props
    paymentSources = fetchPaymentSources(user.id)
    return (
      <ul>
       {paymentSources.map((payment, i) => (
            <div className='circle'/>
            <div className='text'>
              <h4>{payment.brand} <span>ending in {payment.last4}</span></h4>
              <p>{payment.exp_month} {payment.exp_year}</p>
            </div>
    ))}
    </ul>
    )
  }
}