// mint/react/components/View/Invoice/Stripe.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class PaymentSources extends Component {
  static propTypes = {
    invoice: PropTypes.object,
    user: PropTypes.object,
    fetchPaymentSources: PropTypes.func
  }

  state = {
    sources: []
  }

  componentWillMount () {
    const { user, fetchPaymentSources } = this.props
    const sources = fetchPaymentSources(user.id);
    this.setState({ sources });
  }

render() {
  debugger;
  const { sources } = this.props.state
    return (
      <div>
        {sources.map( payment => (
          <div>
            <h4>{payment.brand} <span>ending in {payment.last4}</span></h4>
            <p>{payment.exp_month} {payment.exp_year}</p>
          </div>
        ))}
      </div>
    )
  }
}