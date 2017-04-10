import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router-dom';

export default class DropdownItem extends Component {

  static propTypes = {
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    previousPrice: PropTypes.number.isRequired,
    savePercent: PropTypes.number.isRequired,
    asin: PropTypes.string.isRequired,
    cart_id: PropTypes.string.isRequired
  }

  render() {
    const { price, name, savePercent, asin, cart_id } = this.props;
    return (
      <Link to={`/cart/${cart_id}/m/item/${asin}`} className='dealcard-small'>
        <p><em className='price'>${price.toFixed(2)} </em> {name} ({(savePercent * 100).toFixed()}% off)</p>
      </Link>
    );
  }
}
