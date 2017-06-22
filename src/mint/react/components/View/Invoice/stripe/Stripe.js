// mint/react/components/View/Invoice/Stripe.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {Elements, CardElement, injectStripe} from 'react-stripe-elements';
import './stripe.scss';
import CheckoutForm from './Checkout.js'


class MyStoreCheckout extends Component {
  render() {
    return (
      <Elements>
        <CheckoutForm />
      </Elements>
    );
  }
}



export default MyStoreCheckout