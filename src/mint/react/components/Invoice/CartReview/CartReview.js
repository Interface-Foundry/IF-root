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

  _getCompleteImage(memberNumber) {
    return memberNumber > 3 ? ( memberNumber > 5 ? ( memberNumber > 8 ? '//storage.googleapis.com/kip-random/social/complete_3.png': '//storage.googleapis.com/kip-random/social/complete_3.png') : '//storage.googleapis.com/kip-random/social/complete_2.png') : '//storage.googleapis.com/kip-random/social/complete_1.png';
  }

  render() {
    const { selectedAccordion, selectAccordion, cart, achievements } = this.props, { selectedIndex } = this.state,
      subTotal = displayCost(calculateItemTotal(cart.items), cart.store_locale);

    const totalAchievements = Object.keys(achievements).reduce((acc, key, i) => {
        if(cart.members.length > achievements[key].reqs) acc.push(achievements[key])

        return acc
      }, []);


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
                totalAchievements.map((a, i) => (
                  <li key={i}>
                    <div className='achievement'>
                      <div className='icon'>
                        <div className={'image'} style={{
                          backgroundImage: `url(//storage.googleapis.com/kip-random/social/complete_${i + 1}.png)`
                        }}>
                          {a.reqs}
                        </div>
                      </div>
                      <div className='text'>
                        <p>{a.reqs}pp in Cart</p>
                        <span className='sub'>{a.reward}</span>
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
