// react/components/Invoice/Invoice.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Payment from './Payment';
import Shipping from './Shipping';
import CartReview from './CartReview';
import Forms from './Forms';

export default class Invoice extends Component {
  static propTypes = {
    cart: PropTypes.object,
    fetchInvoices: PropTypes.func,
    fetchPaymentSources: PropTypes.func
  }

componentWillMount() {
    const { fetchPaymentSources, fetchInvoices, cart } = this.props;
    fetchInvoices(cart.id);
    fetchPaymentSources();
  }


  render() {
    const { selectedAccordion } = this.props;
    return (
      <div className='invoice'>
        { selectedAccordion.includes('form') ? <Forms {...this.props}/> : null}
        <Shipping {...this.props}/>
        <Payment {...this.props}/>
        <CartReview {...this.props}/>
      </div>
    );
  }
}
