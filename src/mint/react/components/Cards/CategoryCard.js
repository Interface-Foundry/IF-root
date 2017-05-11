// react/components/Cards/CategoryCard.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { displayCost } from '../../utils';

export default class CategoryCard extends Component {

  static propTypes = {
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired
  }

  render() {
    const { thumbnail: image, name, price, previousPrice, savePercent } = this.props;

    return (
      <section className='card__type-category'>
        <div className='details'>
          <div className='details__image image' style={{backgroundImage:`url(${image})`}}/>
          <div className='details__name'>{name.length > 42 ? name.substring(0, 33) + '…': name}</div>
          <div className='details__price'>{displayCost(price)}</div>
          <div className='details__discount'><strike>{displayCost(previousPrice)}</strike> ({(savePercent * 100).toFixed()}% off)</div>
        </div>
        <div className='add'>Add to Cart</div>
      </section>
    );
  }
}
