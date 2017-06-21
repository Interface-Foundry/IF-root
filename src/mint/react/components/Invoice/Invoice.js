// react/components/Invoice/Invoice.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Payment from './Payment';
import Shipping from './Shipping';
import CartReview from './CartReview';

export default class Invoice extends Component {

  render() {
    return (
      <div className='invoice'>
        <Shipping {...this.props}/>
        <Payment {...this.props}/>
        <CartReview {...this.props}/>
      </div>
    );
  }
}
