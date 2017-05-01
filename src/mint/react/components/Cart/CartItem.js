// react/components/Cart/CartItem.js
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { displayCost } from '../../utils';
import Icon from '../Icon';

export default class CartItem extends Component {
  static propTypes = {
    history: PropTypes.object,
    item: PropTypes.object,
    itemNumber: PropTypes.number.isRequired,
    cart_id: PropTypes.string.isRequired,
    isOwner: PropTypes.bool.isRequired,
    locked: PropTypes.bool
  }

  render() {
    const { itemNumber, locked, isOwner, cart_id, history: { push }, item: { main_image_url, name, price, quantity, id, asin } } = this.props;
    const buttonUrl = isOwner
      ? `/cart/${cart_id}/m/cartItem/${itemNumber}/${id}/edit`
      : `/cart/${cart_id}/m/item/0/${asin}`;
    return (
      <li className='cartItem'>
        {locked ? null : <div className='cartItem__image image col-3 ' style={
          {
            backgroundImage: `url(${main_image_url})`,
            backgroundPosition: 'top',
            height: 75
          }}/>}
        <div className={`cartItem__props col-9 ${ locked ? 'locked' : ''}`}>
          <p>{name}</p>
          <br/>
          <p>Qty: {quantity}</p>
          <p>Price: {displayCost(price)}</p>
          <div className='cartItem__actions'>
            <button 
              className={locked ? 'locked' : ''}
              disabled={locked} 
              onClick={() => push(buttonUrl)}>
                { locked 
                  ? <Icon icon='Locked'/> 
                  : isOwner 
                    ? 'Edit' 
                    : 'View' //TODO: Copy!
                } 
            </button>
          </div>
        </div>
      </li>
    );
  }
}
