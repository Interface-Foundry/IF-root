// react/components/Cards/SearchCard.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { displayCost } from '../../utils';

export default class SearchCard extends Component {

  static propTypes = {
    thumbnail_url: PropTypes.string,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }

  render() {
    const { thumbnail_url, name, price } = this.props;
    return (
      <section className='card__type-search'>
        <div className='details'>
          <div className='details__image image' style={{backgroundImage: `url(${thumbnail_url})`}}/>
          <div className='details__name'>{name.length > 42 ? name.substring(0, 33) + '…': name}</div>
          <div className='details__price'>{displayCost(price)} /each</div>
        </div>
        <div className='add'>VIEW</div>
      </section>
    );
  }
}
