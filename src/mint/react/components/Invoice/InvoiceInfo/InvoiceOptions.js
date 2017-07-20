// react/components/Invoice/InvoiceInfo/InvoiceOptions.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { AddressListContainer } from '../../../containers';
// import PaymentTypes from './PaymentTypes';

export default class InvoiceOptions extends Component {

  render = () => {
    const {
      selectedAccordion,
      selectAccordion,
      invoice: { address: { full_name, line_1, line_2 } },
      fetchPaymentStatus,
      updateInvoice
    } = this.props;

    return (
      <div className='invoice accordion'>
        <nav onClick={() => selectAccordion('changeinvoice')}>
          <h2>Shipping Address</h2>
          {
            selectedAccordion.includes('changeinvoice')
            ? <div>
                <nav><h4>Choose Your Address</h4></nav>
                <AddressListContainer />
              </div>
            : <div>{full_name}, {line_1}, {line_2}</div>

          }

        </nav>
      </div>
    );
  }
}