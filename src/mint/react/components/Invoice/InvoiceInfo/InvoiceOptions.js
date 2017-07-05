// react/components/Invoice/Invoice.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
// import PaymentTypes from './PaymentTypes';

const addressDummy = [
    {
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
        const { selectedAccordion, selectAccordion, invoice, updateInvoice } = this.props,
                { selectedIndex, selectedType } = this.state;

        return (
          <div className='shipping accordion'>
            <nav onClick={() => selectAccordion('shipping')}>
              <h3>Edit Info for Order</h3>
                {
                  selectedIndex !== null && !selectedAccordion.includes('shipping') ? <div className='text'>
                      <p>{addressDummy[selectedIndex].name}</p>
                      <p>{addressDummy[selectedIndex].streetAddress}</p>
                      <p>{addressDummy[selectedIndex].city}, {addressDummy[selectedIndex].state}, {addressDummy[selectedIndex].zip}</p>
                      <span>change</span>
                  </div> : null
                }
            </nav>
            {
              selectedAccordion.includes('shipping') ? <div>
                <nav>
                  <h4>select/edit/remove your address</h4>
                </nav>
                  <ul>
                      {
                          addressDummy.map((address, i) => (
                              <li key={i} className={selectedIndex === i ? 'selected' : ''} onClick={() => this.setState({selectedIndex: i})}>
                                  <div className='circle'/>
                                  <div className='text'>
                                      <h4>{address.name}</h4>
                                      <p>{address.streetAddress}, {address.city}, {address.state}, {address.zip}, {address.country}</p>
                                      <span>edit</span>
                                      <span>delete</span>
                                  </div>
                              </li>
                          ))
                      }
                  </ul>
                  <button onClick={() => selectAccordion('shipping form')}>+ add address</button>

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
     </div> : null
    }
    </div>
    );
  }
}
