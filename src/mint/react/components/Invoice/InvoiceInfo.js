// mint/react/components/View/Invoice/Stripe.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

export default class InvoiceInfo extends Component {
  static propTypes = {
    cart: PropTypes.object,
    invoice: PropTypes.object,
    createInvoice: PropTypes.func,
    fetchLatestInvoiceForCart: PropTypes.func
  }


  componentWillMount() {
    const { fetchLatestInvoiceForCart, cart } = this.props;
    fetchLatestInvoiceForCart(cart.id);
  }

  render() {

    const { selectedAccordion, selectAccordion, cart, invoice, createInvoice } = this.props;
    let invoiceAvailable = false;
    if (invoice !== undefined) {
      invoiceAvailable = true;
    }

    return (
      <div className='payment accordion'>
        <nav onClick={() => selectAccordion('invoiceinfo')}>
          <div>
            <h3> Invoice Info</h3>
          </div>
        </nav>
        {
          selectedAccordion.includes('invoiceinfo') ? <div>
            <nav>
              <h3>create new invoice</h3>
            </nav>
              <div>
                <button onClick={()=> createInvoice(cart.id, 'mint', 'split_single')}>single payer</button>
              </div>
              <div>
                <button onClick={()=> createInvoice(cart.id, 'mint', 'split_equal')}>split equally</button>
              </div>
              <div>
                <button onClick={()=> createInvoice(cart.id, 'mint', 'split_by_item')}>split by item</button>
              </div>
          <div>
            <nav>
              <h3>using this invoice:</h3>
            </nav>
            <div>
             {invoiceAvailable ?
              <text> leader: {invoice.leader.name}, paid: {invoice.paid}, status: {invoice.status}, split_type: {invoice.split_type} </text> : <p> not available create one above </p>}
            </div>
          </div>
        </div> : null
      }
      </div>
    );
  }
}