// react/components/Invoice/Invoice.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import moment from 'moment';

import { Icon } from '../../../../react-common/components';
import { displayCost, numberOfItems, calculateItemTotal } from '../../../utils';

const shippingOptions = [{
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

  static propTypes = {
    selectedAccordion: PropTypes.string,
    selectAccordion: PropTypes.func,
    cart: PropTypes.object
  }

  state = {
    selectedIndex: null
  }

  render() {
    const { selectedAccordion, selectAccordion, cart } = this.props, { selectedIndex } = this.state,
      subTotal = displayCost(calculateItemTotal(cart.items), cart.store_locale),
      Achievements = cart.members.length > 2 ? ( cart.members.length > 5 ? ( cart.members.length > 7 ? [{ reqs: 3, discount: 50 }, { reqs: 6, discount: 80 }, { reqs: 10, discount: 100 }] : [{ reqs: 3, discount: 50 }, { reqs: 6, discount: 80 }] ) : [{ reqs: 3, discount: 50 }] ) :  [];     

    return (
      <div className='review accordion'>
        <nav onClick={() => selectAccordion('review')}>
          <h3>Summary</h3>
          <span className='sub'>{cart.items.length} items</span>
        </nav>
        {
          selectedAccordion.includes('review') ? <div>
            <ul className='items'>
              {
                cart.items.map((item) => (
                  <li key={item.id} className='item'>
                    <div className={'image'} style={{
                      backgroundImage: `url(${item.main_image_url})`
                    }}/>
                    <div className='text'>
                      <h4>{item.name}</h4>
                      <h4 className='right'>Qty: {item.quantity}</h4>
                      <h4 className='price'>{displayCost(item.price * item.quantity, cart.store_locale)}</h4>
                    </div>
                  </li>
                ))
              }
            </ul>
            <ul className='achievements'>
              <nav>
                <p>Subtotal:</p>
                <p className='right price'>{subTotal}</p>
                <h5 className='blue'>Achievements</h5>
              </nav>
              {
                Achievements.map((a, i) => (
                  <li key={i}>
                    <div className='achievement'>
                      <div className='icon'>
                        <Icon icon='Person'/>
                      </div>
                      <div className='text'>
                        <p>{a.reqs}pp in Cart</p>
                        <span className='sub'>{a.discount}% Discount</span>
                        <p className='right'>-{displayCost(calculateItemTotal(cart.items) * (1/a.discount), cart.store_locale)}</p>
                      </div>
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
