// react/components/Invoice/Invoice.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import PaymentForm from './PaymentForm';
import ShippingForm from './ShippingForm';


export default class Forms extends Component {

  renderForm() {
    const { selectedAccordion } = this.props;

    switch (selectedAccordion.split(' form')[0]) {
      case 'payment':
        return <PaymentForm {...this.props}/>;
      case 'shipping':
        return <ShippingForm {...this.props}/>;
    }
  }

  render() {
    const { selectedAccordion, selectAccordion } = this.props;

    return (
      <div className='forms' onClick={(e) => {
        e.target.className === 'forms' ? selectAccordion(selectedAccordion.split(' form')[0]) : null;
      }}>
        <div className='forms__modal'>
          {
            this.renderForm()
          }
        </div>
      </div>  
    );
  }
}
