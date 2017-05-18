import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { displayCost } from '../../utils';
import AddRemove from './AddRemove';

export default class ItemInfo extends Component {
  static propTypes = {
    name: PropTypes.string,
    price: PropTypes.number,
    quantity: PropTypes.number,
    type: PropTypes.string,
    unit_type: PropTypes.string,
    currentCart: PropTypes.object
  };

  render() {
    const { props, props: { price, currentCart, quantity = 1, type, unit_type } } = this;
    const locale = currentCart.store ? currentCart.store.includes('amazon') ? (currentCart.store_locale === 'uk' ? 'GBP' : 'USD') : 'GBP' : null;
    let convertedPrice = price ? displayCost(price, locale) : 0,
      total = price ? displayCost(price * quantity, locale) : 0;

    return (
      price
      ? <div className='item__view__price'>
          <div>
            {quantity > 1 ? <h5>Price: {convertedPrice} <span>{unit_type ? unit_type === 'PK' ? ' /package' : ' /each' : ''}</span></h5> : null}

            <h4>Total: <span>{total}<span>{unit_type && quantity < 2 ? unit_type === 'PK' ? ' /package' : ' /each' : ''}</span></span></h4>
          </div>
          {type === 'cartItem' ? <AddRemove {...props} /> : null}
        </div>
      : null
    );
  }
}
