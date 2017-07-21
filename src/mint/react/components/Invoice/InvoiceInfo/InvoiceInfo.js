// mint/react/components/View/Invoice/Stripe.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InvoiceOptions from './InvoiceOptions';

export default class InvoiceInfo extends Component {
  static propTypes = {
    cart: PropTypes.object,
    invoice: PropTypes.object,
    selectAccordion: PropTypes.func,
    updateInvoice: PropTypes.func
  }

  render() {

    const { selectAccordion, cart, user, invoice, } = this.props;
    const isLeader = user.id === cart.leader.id;

    return (
      <div className='delivery accordion'>
        <nav onClick={() => {
          //selectAccordion('invoiceinfo')// 
        }}>
          <h3>Delivery</h3>
          <p>
            906 Broadway <br/> New York, NY 10010
          </p>
        </nav>
      </div>
    );
  }
}


