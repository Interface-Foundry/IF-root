// react/components/Display/ArchivedCarts/ArchivedCarts.js

import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { Link } from 'react-router-dom';

export default class ArchivedCarts extends Component {

  static propTypes = {
    archivedCarts: PropTypes.array
  }

  render() {
    const { archivedCarts } = this.props;

    return (
      <ul className='archivedCarts'>
        {
        archivedCarts.map(c =>
          <li key={c.id}> 
            <Link className='archivedCart' to={`/cart/${c.id}`}>
              <CartPreview imageUrls={c.items.map(i => i.main_image_url)}/>
              <div className='cartInfo'>
                <p className='cartName'>{c.name}</p>
                <p className='cartStore'>{c.store} ({c.store_locale})</p>
                <p className='cartItemsCount'>{c.items.length} Item{c.items.length === 1 ? '' : 's'}</p>
                <p className='cartMembersCount'>{c.members.length} Member{c.members.length === 1 ? '' : 's'}</p>
              </div>
            </Link>
          </li>)
        }
      </ul>
    );
  }
}

class CartPreview extends Component {
  static propTypes = {
    imageUrls: PropTypes.array
  }

  state = {
    images: []
  }

  componentWillMount() {
    const { imageUrls } = this.props;
    while (imageUrls.length > 0 && this.state.images.length < 4) {
      this.state.images.push(...imageUrls.splice(Math.floor(Math.random() * imageUrls.length), 1));
    }
  }

  render() {
    const { images } = this.state;
    return (
      <div className='image-container'>
        {images.map((img, i)=><div className='quarter image' key={i} style={{backgroundImage: `url(${img})`}}/>)}
      </div>
    );
  }
}
