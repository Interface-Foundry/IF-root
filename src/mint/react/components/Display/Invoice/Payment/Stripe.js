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
    createPaymentSource: PropTypes.func
  }


  componentWillMount() {
    const { fetchPaymentStatus, invoice } = this.props;
    fetchPaymentStatus(invoice.id);
  }

  render() {
    const { user, invoice, userPaymentStatus, createPaymentSource } = this.props;
    const invoiceId = invoice.id;
    const amount = userPaymentStatus.amount;
    return (
      <StripeCheckout
        token={(stripe_data) => createPaymentSource(amount, stripe_data, 'stripe', invoiceId)}
        stripeKey={process.env.STRIPE_KEY}
        email={user.email_address}
        name="Kip"
        description="Mint"
        panelLabel="PAY UP"
        allowRememberMe={false}
        amount={amount}
      >
        <button>+ add card with stripe</button>
      </StripeCheckout>
    );
  }
}
