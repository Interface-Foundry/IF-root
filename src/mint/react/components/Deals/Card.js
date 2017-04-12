import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router-dom';

export default class Card extends Component {

  static propTypes = {
    small: PropTypes.string,
    medium: PropTypes.string,
    large: PropTypes.string,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    previousPrice: PropTypes.number.isRequired,
    savePercent: PropTypes.number.isRequired,
    asin: PropTypes.string.isRequired,
    cart_id: PropTypes.string
  }

  render() {
    const { small, medium, large, asin, name, price, previousPrice, savePercent, cart_id, index } = this.props;
    const imageSrc = medium || large || small;

    return (
      <Link to={`/cart/${cart_id}/m/deal/${index}/${asin}`} className='dealcard'>
        <div className='dealcard__image' style={{backgroundImage:`url(${imageSrc})`}}/>
        <div className='dealcard__name'>{name}</div>
        <div className='dealcard__price'>${price.toFixed(2)}</div>
        <div className='dealcard__discount'><strike>${previousPrice.toFixed(2)}</strike> ({(savePercent * 100).toFixed()}% off)</div>
        <div className='dealcard__add'>Add to Cart</div>
      </Link>

    );
  }
}
