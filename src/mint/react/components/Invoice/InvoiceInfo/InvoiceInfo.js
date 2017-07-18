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

  // shouldComponentUpdate = ({ invoice }) =>
  //   invoice !== this.props.invoice

  render() {

    const { selectAccordion, cart, user, invoice, } = this.props;
    const isLeader = user.id === cart.leader.id;

    return (
      <div className='payment accordion'>
        <nav onClick={() => selectAccordion('invoiceinfo')}>
          <div>
            <h3>Delivery</h3>
          </div>
          <div>

          </div>
        </nav>
      </div>
    );
  }
}
