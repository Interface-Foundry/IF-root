import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router-dom';

export default class Card extends Component {

  static propTypes = {
    small: PropTypes.string.isRequired,
    medium: PropTypes.string.isRequired,
    large: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    previousPrice: PropTypes.number.isRequired,
    savePercent: PropTypes.number.isRequired,
    asin: PropTypes.string.isRequired,
    cart_id: PropTypes.string.isRequired
  }

  render() {
    const { small, medium, large, asin, name, price, previousPrice, savePercent, cart_id } = this.props;
    const imageSrc = medium || large || small;
    return (
      <Link to={`/cart/${cart_id}/m/item/${asin}`} className='dealcard'>
        <div className='dealcard__price'>${price}</div>
        <div className='dealcard__discount'><strike>${previousPrice}</strike> ({(savePercent * 100) | 2}% off)</div>
        <div className='dealcard__image' style={{backgroundImage:`url(${imageSrc})`}}/>
        <div className='dealcard__name'>{name}</div>
      </Link>
    );
  }
}
