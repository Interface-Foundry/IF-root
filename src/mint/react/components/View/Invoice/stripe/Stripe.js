// mint/react/components/View/Invoice/Stripe.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import StripeCheckout from 'react-stripe-checkout';

export default class Stripe extends Component {

  static propTypes = {
    invoice: PropTypes.object,
    user: PropTypes.object,
    createPaymentSource: PropTypes.func
  }

  onToken = (token) => {
    createPaymentSource(token, user_id)
  }


  render() {
    const { invoice, user, createPaymentSource } = this.props,

    return (
      <StripeCheckout
        token={this.onToken}
        stripeKey="pk_test_8bnLnE2e1Ch7pu87SmQfP8p7"
      />
    )
  }
}