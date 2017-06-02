// react/components/Cards/CategoryCard.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class CategoryCard extends Component {

  static propTypes = {
    humanName: PropTypes.string.isRequired,
    machineName: PropTypes.string.isRequired,
    itemCount: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
    previewAmazonItem: PropTypes.func
  }

  render() {
    const { humanName, image, itemCount, machineName, previewAmazonItem, currentCart } = this.props;

    return (
      <section className='card__type-category' onClick={() => {
        previewAmazonItem(machineName, currentCart.store, currentCart.store_locale)
      }}>
        <div className='details'>
          <div className='details__image image' style={{backgroundImage:`url(${image})`}}/>
          <div className='details__name'>{humanName.length > 42 ? humanName.substring(0, 33) + '…': humanName}</div>
        </div>
        <div className='add'>BROWSE ({itemCount})</div>
      </section>
    );
  }
}
