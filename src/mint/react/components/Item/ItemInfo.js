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
    unit_type: PropTypes.string
  };

  render() {
    const { props, props: { price, quantity = 1, type, unit_type } } = this;
    let convertedPrice = price ? displayCost(price) : 0,
      total = price ? displayCost(price * quantity) : 0;

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
