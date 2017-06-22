import React, { Component } from 'react';
import {Elements, CardElement, injectStripe} from 'react-stripe-elements';

class CardSection extends Component {
  render() {
    return (
      <stripe-label>
        Card details
        <CardElement style={{base: {fontSize: '18px'}}} />
      </stripe-label>
    );
  }
};

class CheckoutForm extends Component {
  handleSubmit = (ev) => {
    // We don't want to let default form submission happen here, which would refresh the page.
    ev.preventDefault();

    // Within the context of `Elements`, this call to createToken knows which Element to
    // tokenize, since there's only one in this group.
    this.props.stripe.createToken({name: 'Heh'}).then(({token}) => {
      console.log('Received Stripe token:', token);
    });

    // However, this line of code will do the same thing:
    // this.props.stripe.createToken({type: 'card', name: 'Jenny Rosen'});
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <CardSection />
        <button1>Confirm order</button1>
      </form>
    );
  }
}

export default injectStripe(CheckoutForm);