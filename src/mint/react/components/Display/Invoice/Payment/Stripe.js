// mint/react/components/View/Invoice/Stripe.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import StripeCheckout from 'react-stripe-checkout';

export default class Stripe extends Component {

  static propTypes = {
    invoice: PropTypes.object,
    user: PropTypes.object,
    cart: PropTypes.object,
    userPaymentStatus: PropTypes.object,
    createPaymentSource: PropTypes.func,
    fetchPaymentStatus: PropTypes.func
  }

  // componentWilMount() {
  //   const { fetchPaymentStatus, invoice, userPaymentStatus } = this.props;
  //   console.log({ line: 'stripe.js:20', userPaymentStatus });
  //   if (!userPaymentStatus.amount) fetchPaymentStatus(invoice.id);
  // }

  render() {
    const { user, invoice, userPaymentStatus, createPaymentSource } = this.props;
    const invoiceId = invoice.id;
    const amount = userPaymentStatus.amount;
    return (
      <StripeCheckout
        token={(stripe_data) => createPaymentSource(amount, stripe_data, 'stripe', invoiceId)}
        stripeKey={STRIPE_KEY}
        email={user.email_address}
        name="Kip"
        description="Mint"
        panelLabel="PAY UP"
        allowRememberMe={false}
        amount={amount}
      >
        <button>+ Add a Card with Stripe</button>
      </StripeCheckout>
    );
  }
}