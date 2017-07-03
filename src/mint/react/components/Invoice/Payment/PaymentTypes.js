// mint/react/components/View/Invoice/Payment/PaymentTypes.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';


const paymentTypes = [
  {
    text: 'admin pay for all',
    type: 'split_single'
  }, {
    text: 'each person pay for their item',
    type: 'split_by_item'
  }, {
    text: 'Equal Split',
    type: 'split_equal'
  }
];

export default class PaymentSources extends Component {
  static propTypes = {
    invoice: PropTypes.object,
  }

  state = {
    selectedType: null
  }


  render() {

    const { state: { selectedType } } = this;

    return (
      <div>
      <nav>
        <h4>Payment Type</h4>
      </nav>
      <ul>
        {
          paymentTypes.map((paymentType, i) => (
            <li key={i} className={selectedType === paymentType.type ? 'selected' : ''} onClick={() => {
                  this.setState({selectedType: paymentType.type});
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
    );
  }
}