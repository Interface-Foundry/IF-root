// react/components/Cards/SearchCard.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { displayCost, getLastSearch } from '../../utils';
import { Link } from 'react-router-dom';


export default class SearchCard extends Component {

  static propTypes = {
    thumbnail_url: PropTypes.string,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }

  render() {
    const { thumbnail_url, image_url, name, price, cart_id, index } = this.props;
    return (
      <Link to={`/cart/${cart_id}/m/search/${index}/${encodeURIComponent(getLastSearch())}`}>
        <section className='card__type-search'>
          <div className='details'>
            <div className='details__image image' style={{backgroundImage: `url(${thumbnail_url || image_url})`}}/>
            <div className='details__name'>{name.length > 42 ? name.substring(0, 33) + '…': name}</div>
            <div className='details__price'>{displayCost(price)} /each</div>
          </div>
          <div className='add'>VIEW</div>
        </section>
      </Link>
    );
  }
}
