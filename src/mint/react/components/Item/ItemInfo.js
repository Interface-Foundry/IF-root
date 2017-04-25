import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { displayCost } from '../../utils';
import AddRemove from './AddRemove';

export default class ItemInfo extends Component {
  static propTypes = {
    name: PropTypes.string,
    price: PropTypes.number,
    quantity: PropTypes.number
  };

  render() {
    const { props, props: { price, quantity } } = this;
    const convertedPrice = price ? displayCost(price) : '0.00';
    const total = displayCost(price * quantity);
    return (
      <div className='item__view__price'>
        <div>
          {quantity>1? <h5>Price: {convertedPrice}</h5>:null}
          <h4>Total: <span>{total}</span></h4>
        </div>
        <AddRemove {...props} />
      </div>
    );
  }
}
