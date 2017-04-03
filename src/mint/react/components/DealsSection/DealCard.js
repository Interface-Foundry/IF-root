import React, { Component, PropTypes } from 'react';

export default class DealCart extends Component {
  constructor(props) {
    super(props);
    this.generateCard = ::this.generateCard;
    this.generateDropdown = ::this.generateDropdown;
  }
  static propTypes = {
    small: PropTypes.string.isRequired,
    medium: PropTypes.string.isRequired,
    large: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    previousPrice: PropTypes.number.isRequired,
    savePercent: PropTypes.number.isRequired,
    asin: PropTypes.string.isRequired
  }

  generateDropdown() {
    const { name, savePercent, asin } = this.props;
    return (<div className='dealcard__smallview'>
      <p className='dealcard__name'>{name} ({(savePercent * 100) | 2}% off) ({asin})</p>
    </div>);
  }

  generateCard() {
    const { small, medium, large, name, price, previousPrice, savePercent, asin } = this.props;
    const imageSrc = small || medium || large;
    return (<div className='dealcard__largeview'>
      <img src={imageSrc}></img>
      <p className='dealcard__name'>{name} ({asin})</p> { /* ASIN is just for adding to the cart later */ }
      <p className='dealcard__price'>${price}</p>
      <p className='dealcard__prevPrice'>${previousPrice}</p>
      <p className='dealcard__percentOff'>{(savePercent * 100) | 2}% off</p>
    </div>);
  }

  render() {
    const { generateCard, generateDropdown, props } = this;
    const { small } = props;
    return (small ? generateDropdown() : generateCard());
  }
}
