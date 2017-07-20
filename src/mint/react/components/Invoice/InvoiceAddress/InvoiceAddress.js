// react/components/Invoice/InvoiceInfo/InvoiceOptions.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { AddressListContainer } from '../../../containers';
// import PaymentTypes from './PaymentTypes';

export default class InvoiceAddress extends Component {
  static propTypes = {
    selectedAccordion: PropTypes.string,
    selectAccordion: PropTypes.func,
    invoice: PropTypes.object,
    isLeader: PropTypes.bool
  }
  render = () => {
    const {
      selectedAccordion,
      selectAccordion,
      isLeader,
      invoice: { address: { full_name, line_1, city } }
    } = this.props;

    return (
      <div className={`invoice accordion ${isLeader ? 'clickable' : ''}`} onClick={() => selectAccordion('changeinvoice')}>
        <nav className={isLeader ? 'clickable' : ''}>
          <h2>1. Shipping Address</h2>
        </nav>
          {
            selectedAccordion.includes('changeinvoice')
            ? <div>
                <nav><h4>Choose Your Address</h4></nav>
                <AddressListContainer />
              </div>
            : <div className='address-preview'>
                <p>{full_name}, {line_1}, {city}</p>
                {isLeader ? <span>Change</span> : null}
              </div>
          }
      </div>
    );
  }
}