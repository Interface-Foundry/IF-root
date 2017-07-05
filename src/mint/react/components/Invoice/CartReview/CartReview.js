// react/components/Invoice/Invoice.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import moment from 'moment';

import { calculateItemTotal, displayCost, timeFromDate, numberOfItems } from '../../../utils';

const shippingOptions = [
  {
    name: 'Fast',
    shippingDate: moment().add(1, 'days').format('DD/MM/YYYY'),
    price: 100
  },
  {
    name: 'slow',
    shippingDate: moment().add(10, 'days').format('DD/MM/YYYY'),
    price: 10
  }
];

export default class CartReview extends Component {

  state = {
    selectedIndex: null
  }

  render() {
  	const { selectedAccordion, selectAccordion, cart } = this.props,
      { selectedIndex } = this.state;

    return (
    	<div className='review accordion'>
    		<nav onClick={() => selectAccordion('review')}>
    			<h3>2. Items and shipping</h3>
          {
              selectedIndex !== null && !selectedAccordion.includes('review') ? <div className='text'>
                  <p>{numberOfItems(cart.items)} Items shipping {shippingOptions[selectedIndex].name} on {shippingOptions[selectedIndex].shippingDate}</p>
                  <span>change</span>
              </div> : null
          }
    		</nav>
    		{
    			selectedAccordion.includes('review') ? <div>
            <ul className='items'>
              <nav>
                <h4>Cart Review</h4>
              </nav>
              {
                cart.items.map((item) => (
                  <li key={item.id} className='item'>
                    <div className={'image'} style={{
                      backgroundImage: `url(${item.main_image_url})`
                    }}/>
                    <div className='text'>
                      <h4>{item.name}</h4>
                      <h4>Qty: {item.quantity}</h4>
                      <h4>{displayCost(item.price * item.quantity, cart.store_locale)}</h4>
                    </div>
                  </li>
                ))
              }
            </ul>
            <ul className='delivery'>
              <nav>
                <h4>Delivery option</h4>
              </nav>
              {
                shippingOptions.map((option, i) => (
                  <li key={i} className={selectedIndex === i ? 'selected' : ''} onClick={() => this.setState({selectedIndex: i})}>
                      <div className='circle'/>
                      <div className='text'>
                        <h4>{option.name}</h4>
                        <p>Delivery on {option.shippingDate}</p>
                        <p>{displayCost(option.price, cart.store_locale)}</p>
                      </div>
                  </li>
                ))
              }
            </ul>
	    		</div> : null
    		}
    	</div>
    );
  }
}
