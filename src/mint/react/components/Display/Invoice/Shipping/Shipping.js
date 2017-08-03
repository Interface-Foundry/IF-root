// react/components/Invoice/Invoice.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import moment from 'moment';

import { displayCost, numberOfItems } from '../../../../utils';

const shippingOptions = [{
    name: 'Expedited',
    shippingDate: moment().add(1, 'days').format('YYYY-MM-DD'),
    price: 499,
    disabled: !SHIPPING_OPTIONS_ENABLED
  },
  {
    name: 'Standard',
    shippingDate: moment().add(10, 'days').format('YYYY-MM-DD'),
    price: 0
  }
];

export default class Shipping extends Component {

  static propTypes = {
    selectedAccordion: PropTypes.string,
    selectAccordion: PropTypes.func,
    cart: PropTypes.object
  }

  state = {
    selectedIndex: 1
  }

  render() {
    const { selectedAccordion, selectAccordion, cart, isLeader } = this.props, { selectedIndex } = this.state;

    return (
      <div className='review accordion clickable' onClick={() => selectAccordion('review')}>
        <nav className='clickable'>
          <h3>3. Items and shipping</h3>
        </nav>
        {
          selectedAccordion.includes('review') ? <div>
            <ul className='items'>
              <nav>
                <h4>Items</h4>
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
                <h4>Choose your delivery option</h4>
              </nav>
              {
                shippingOptions.map((option, i) => {
                  const classes = [
                    option.disabled ? 'disabled' : 'clickable',
                    selectedIndex === i ? 'selected' : null
                  ].filter(Boolean).join(' ')

                  return (
                    <li key={i} className={classes} onClick={() => option.disabled || this.setState({selectedIndex: i})}>
                        <div className='circle'/>
                        <div className='text'>
                          <h4>{option.name}</h4>
                          <p>Delivery on {option.shippingDate}</p>
                          <p>{displayCost(option.price, cart.store_locale)}</p>
                        </div>
                    </li>
                  );
                })
              }
            </ul>
          </div>
          : <div className='review-preview'>
              <p>{numberOfItems(cart.items)} Items shipping {shippingOptions[selectedIndex].name} on {shippingOptions[selectedIndex].shippingDate}</p>
              <span>Change Shipping Method</span>
            </div>
        }
      </div>
    );
  }
}