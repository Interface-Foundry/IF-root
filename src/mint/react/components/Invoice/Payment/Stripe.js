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
    console.log('fetching paymentstatus', invoice.id);
    fetchPaymentStatus(invoice.id);
  }


  render() {
    const { user, userPaymentStatus, createPaymentSource } = this.props;
    return (
      <StripeCheckout
        token={(stripe_data) => createPaymentSource(stripe_data, 'stripe')}
        stripeKey="pk_test_8bnLnE2e1Ch7pu87SmQfP8p7"
        email={user.email_address}
        name="Kip"
        description="Mint"
        panelLabel="PAY UP"
        allowRememberMe={false}
        amount={userPaymentStatus.amount * 100}
      >
        <button>+ add card with stripe</button>
      </StripeCheckout>
    );
  }
}