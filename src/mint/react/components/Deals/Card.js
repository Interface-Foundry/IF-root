// react/components/Deals/Card.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { displayCost } from '../../utils';

export default class Card extends Component {

  static propTypes = {
    thumbnail: PropTypes.string,
    main_image: PropTypes.string,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    previousPrice: PropTypes.number.isRequired,
    savePercent: PropTypes.number.isRequired,
  }

  render() {
    const { thumbnail: image, name, price, previousPrice, savePercent } = this.props;
    return (
      <section className='dealcard'>
        <div className='dealcard__details'>
          <div className='dealcard__details__image image' style={{backgroundImage:`url(${image})`}}/>
          <div className='dealcard__details__name'>{name.length > 42 ? name.substring(0, 33) + '…': name}</div>
          <div className='dealcard__details__price'>{displayCost(price)}</div>
          <div className='dealcard__details__discount'><strike>{displayCost(previousPrice)}</strike> ({(savePercent * 100).toFixed()}% off)</div>
        </div>
        <div className='dealcard__add'>Add to Cart</div>
      </section>
    );
  }
}
