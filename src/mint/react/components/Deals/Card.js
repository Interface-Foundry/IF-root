import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { displayCost } from '../../utils';

export default class Card extends Component {

  static propTypes = {
    small: PropTypes.string,
    medium: PropTypes.string,
    large: PropTypes.string,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    previousPrice: PropTypes.number.isRequired,
    savePercent: PropTypes.number.isRequired,
  }

  render() {
    const { small, medium, large, name, price, previousPrice, savePercent } = this.props;
    const imageSrc = medium || large || small;

    return (
      <section className='dealcard'>
        <div className='dealcard__details'>
          <div className='dealcard__details__image image' style={{backgroundImage:`url(${imageSrc})`}}/>
          <div className='dealcard__details__name'>{name.length > 35 ? name.substring(0, 32) + '…': name}</div>
          <div className='dealcard__details__price'>{displayCost(price)}</div>
          <div className='dealcard__details__discount'><strike>{displayCost(previousPrice)}</strike> ({(savePercent * 100).toFixed()}% off)</div>
        </div>
        <div className='dealcard__add'>Add to Cart</div>
      </section>
    );
  }
}
