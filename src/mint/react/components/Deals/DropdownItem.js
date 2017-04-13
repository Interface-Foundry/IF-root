import React, { Component, PropTypes } from 'react';
import { Icon } from '..';

export default class DropdownItem extends Component {
  render() {
    const { props } = this;
    return (
      <section className='dealcard-small'>
        <PriceTag/> <Text {...props} />
      </section>
    );
  }
}

class PriceTag extends Component {
  render() {
    return (
      <div className='priceTagIcon'>
        <Icon icon='PriceTag'/> 
      </div>
    );
  }
}

class Text extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    previousPrice: PropTypes.number.isRequired,
    savePercent: PropTypes.number.isRequired
  }

  render() {
    const { price, name, savePercent } = this.props;
    return (
      <p>
        <em className='price'>
          ${price.toFixed(2)}
        </em>
        {' ' + name}
        ({(savePercent * 100).toFixed()}% off)
      </p>
    );
  }
}
