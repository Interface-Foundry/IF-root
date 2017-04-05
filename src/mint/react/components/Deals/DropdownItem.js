import React, { Component, PropTypes } from 'react';

export default class DropdownItem extends Component {

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

  render() {
    const { name, savePercent, asin } = this.props;
    return (
      <section className='dealcard'>
        <p className='dealcard__name'>{name} ({(savePercent * 100) | 2}% off) ({asin})</p>
      </section>
    );
  }
}
