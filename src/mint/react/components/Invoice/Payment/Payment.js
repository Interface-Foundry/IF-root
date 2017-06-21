// react/components/Invoice/Invoice.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import moment from 'moment';

const paymentTypes = [
  'Pay For All',
  'Pay Mine Only',
  'Equal Split'
]

const paymentDummy = [
    {
        type: 'Visa',
        lastFour: '4200',
        name: 'Derp Visa',
        expire: new Date()
    },
    {
        type: 'MasterCard',
        lastFour: '4200',
        name: 'Derp Mastercard',
        expire: new Date()
    },
    {
        type: 'American Express',
        lastFour: '4200',
        name: 'Derp American Express',
        expire: new Date()
    }
]

export default class Payment extends Component {

  state = {
    selectedTypeIndex: null,
    selectedCardIndex: null
  }

  render() {
  	const { selectedAccordion, selectAccordion } = this.props,
          { selectedCardIndex, selectedTypeIndex } = this.state;
          
    return (
    	<div className='payment accordion' onClick={() => selectAccordion('payment')}>
    		<nav>
    			<h3>2. Payment method</h3>
          {
              selectedCardIndex !== null && selectedTypeIndex !== null && selectedAccordion !== 'payment' ? <div className='text'> 
                  <p>{paymentTypes[selectedTypeIndex]} with {paymentDummy[selectedCardIndex].name} </p>
                  <span>change</span>
              </div> : null
          }
    		</nav>
    		{
    			selectedAccordion === 'payment' ? <div> 
            <nav>
              <h4>Payment Type</h4>
            </nav>
            <ul>
              {
                  paymentTypes.map((type, i) => (
                      <li key={i} className={selectedTypeIndex === i ? 'selected' : ''} onClick={() => this.setState({selectedTypeIndex: i})}>
                          <div className='circle'/>
                          <div className='text'>
                            <h4>{type}</h4>
                          </div>
                      </li>
                  ))
              }
            </ul>
            <nav>
              <h4>Your credit and debit cards</h4>
            </nav>
            <ul>
              {
                  paymentDummy.map((payment, i) => (
                      <li key={i} className={selectedCardIndex === i ? 'selected' : ''} onClick={() => this.setState({selectedCardIndex: i})}>
                          <div className='circle'/>
                          <div className='text'>
                            <h4>{payment.type} <span>ending in {payment.lastFour}</span></h4>
                            <p>{payment.name}</p>
                            <p>expires: {moment(payment.expire).format('MM/YYYY')}</p>
                          </div>
                      </li>
                  ))
              }
              <button>+ add card</button>
            </ul>
	    		</div> : null
    		}
    	</div>
    );
  }
}
