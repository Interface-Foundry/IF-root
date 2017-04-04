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

  // Lots of throwaway code in here, need to wait until we actually have enpoint that returns member id with item.
  generateDropdown() {
    const { name, savePercent, asin, cart_id, fetchItem, replace, user_accounts } = this.props;
    return (<section className='dealcard' onClick={() => fetchItem(cart_id, asin, replace, user_accounts)}>
      <p className='dealcard__name'>{name} ({(savePercent * 100) | 2}% off) ({asin})</p>
    </section>);
  }

  // Lots of throwaway code in here, need to wait until we actually have enpoint that returns member id with item.
  generateCard() {
    const { small, medium, large, name, price, previousPrice, savePercent, asin, cart_id, fetchItem, replace, user_accounts } = this.props;
    const imageSrc = small || medium || large;
    return (
      <section className='dealcard' onClick={() => fetchItem(cart_id, asin, replace, user_accounts)}>
        <div className='dealcard__price'>${price}</div>
        <div className='dealcard__discount'><strike>${previousPrice}</strike> ({(savePercent * 100) | 2}% off)</div>
        <img src={imageSrc}></img>
        <div className='dealcard__name'>{name}</div>
      </section>);
  }

  render() {
    const { generateCard, generateDropdown, props } = this;
    const { small } = props;
    return (small ? generateDropdown() : generateCard());
  }
}
