// react/components/Invoice/InvoiceInfo/InvoiceOptions.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {AddressListContainer} from '../../../containers';
// import PaymentTypes from './PaymentTypes';

const addressDummy = [{
    name: 'Derp Address 1',
    streetAddress: '410 Derp street apt 1D',
    city: 'Derponia',
    state: 'DP',
    zip: 36020,
    country: 'United Derps'
  },
  {
    name: 'Derp Address 2',
    streetAddress: '420 Derp street apt 2D',
    city: 'Derponia',
    state: 'DP',
    zip: 36020,
    country: 'United Derps'
  },
  {
    name: 'Derp Address 3',
    streetAddress: '430 Derp street apt 3D',
    city: 'Derponia',
    state: 'DP',
    zip: 36020,
    country: 'United Derps'
  }
];

const paymentTypes = [{
  type: 'split_single',
  text: 'admin pay for all'
}, {
  type: 'split_equal',
  text: 'split equally amongst the people of kip!'
}, {
  type: 'split_by_item',
  text: 'split by item'
}];

export default class InvoiceOptions extends Component {

  state = {
    selectedIndex: null,
    selectedType: null
  }

  render() {
    const { selectedAccordion, selectAccordion, invoice, fetchPaymentStatus, updateInvoice } = this.props, { selectedIndex, selectedType } = this.state;

    return (
      <div className='invoice accordion'>
            <nav onClick={() => selectAccordion('changeinvoice')}>
              <h3>Edit Info for Order</h3>
                {
                  selectedIndex !== null && !selectedAccordion.includes('changeinvoice') ? <div className='text'>
                      <p>{addressDummy[selectedIndex].name}</p>
                      <p>{addressDummy[selectedIndex].streetAddress}</p>
                      <p>{addressDummy[selectedIndex].city}, {addressDummy[selectedIndex].state}, {addressDummy[selectedIndex].zip}</p>
                      <span>change</span>
                  </div> : null
                }
            </nav>
            {
              selectedAccordion.includes('changeinvoice') ?
              <div>
                <nav>
                  <h4>Choose Your Address</h4>
                </nav>
                <AddressListContainer />
                <div>
                  <nav>
                    <h4>Payment Type</h4>
                  </nav>
                  <ul>
                    {
                      paymentTypes.map((paymentType, i) => (
                        <li key={i} className={selectedType === i ? 'selected' : ''} onClick={() => {
                          this.setState({selectedType: i});
                          updateInvoice(invoice.id, 'split_type', paymentType.type);
                        }}>
                        <div className='circle'/>
                        <div className='text'>
                          <h4>{paymentType.text}</h4>
                        </div>
                        </li>
                      ))
                    }

                  </ul>
                </div>
              </div>
              : null
    }
    </div>
    );
  }
}
