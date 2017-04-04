import React, { Component, PropTypes } from 'react';

export default class DealCard extends Component {
  constructor(props) {
    super(props);
    this.generateCard = ::this.generateCard;
    this.generateDropdown = ::this.generateDropdown;
  }
  static propTypes = {
    small: PropTypes.string,
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
    return (<section className='dealcard'>
      <a href={`/m/item/${asin}`} className='dealcard__name'>{name} ({(savePercent * 100) | 2}% off) ({asin})</a>
    </section>);
  }

  generateCard() {
    const { small, medium, large, name, price, previousPrice, savePercent, asin } = this.props;
    const imageSrc = small || medium || large;
    return (
      <a href={`/m/item/${asin}`}>
        <section className='dealcard'>
          <div className='dealcard__price'>${price}</div>
          <div className='dealcard__discount'><strike>${previousPrice}</strike> ({(savePercent * 100) | 2}% off)</div>
          <img src={imageSrc}></img>
          <div className='dealcard__name'>{name}</div>
        </section>
      </a>);
  }

  render() {
    const { generateCard, generateDropdown, props } = this;
    const { small } = props;
    return (small ? generateDropdown() : generateCard());
  }
}
