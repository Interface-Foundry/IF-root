import PropTypes from 'prop-types';
import React, { Component } from 'react';

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
        <div className='dealcard__image' style={{backgroundImage:`url(${imageSrc})`}}/>
        <div className='dealcard__name'>{name}</div>
        <div className='dealcard__price'>${price.toFixed(2)}</div>
        <div className='dealcard__discount'><strike>${previousPrice.toFixed(2)}</strike> ({(savePercent * 100).toFixed()}% off)</div>
        <div className='dealcard__add'>Add to Cart</div>
      </section>
    );
  }
}
