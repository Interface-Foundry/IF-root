// react/components/Invoice/Invoice.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Payment from './Payment';
import InvoiceInfo from './InvoiceInfo';
import CartReview from './CartReview';
import Forms from './Forms';

export default class Invoice extends Component {
  static propTypes = {
    cart: PropTypes.object,
    createInvoice: PropTypes.func,
    selectedAccordion: PropTypes.string
  }

  componentWillMount() {
    const { createInvoice, cart } = this.props;
    createInvoice(cart.id, 'mint', 'split_by_item');
  }


  render() {
    const { selectedAccordion } = this.props;
    return (
      <div className='invoice'>
        { selectedAccordion.includes('form') ? <Forms {...this.props}/> : null}
        <InvoiceInfo {...this.props}/>
        <Payment {...this.props}/>
        <CartReview {...this.props}/>
      </div>
    );
  }
}
