// react/components/Cart/CartItem.js
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { displayCost } from '../../utils';
import { Icon } from '../../../react-common/components';
import ProgressiveImage from 'react-progressive-image';

export default class CartItem extends Component {
  static propTypes = {
    history: PropTypes.object,
    item: PropTypes.object,
    itemNumber: PropTypes.number.isRequired,
    cart_id: PropTypes.string.isRequired,
    isOwner: PropTypes.bool.isRequired,
    locked: PropTypes.bool,
    currentCart: PropTypes.object
  }

  render() {
    const { itemNumber, locked, currentCart, isOwner, cart_id, history: { push }, item: { main_image_url, name, price, quantity, id, asin } } = this.props;
    const buttonUrl = isOwner
      ? `/cart/${cart_id}/m/cartItem/${itemNumber}/${id}/edit`
      : `/cart/${cart_id}/m/cartView/0/${id}`;

    const locale = currentCart.store.includes('amazon') ? (currentCart.store_locale === 'uk' ? 'GBP' : 'USD') : 'GBP';

    return (
      <li className='cartItem'>

        {locked 
          ? null 
          : <ProgressiveImage src={main_image_url} placeholder='//storage.googleapis.com/kip-random/kip_head_whitebg.png'>
              {(src) => 
                <div 
                  className='cartItem__image image col-3 ' 
                  style={
                    {
                      backgroundImage: `url(${src})`,
                      backgroundPosition: 'top',
                      height: src.includes('kip-random') ? 25 : 75
                    }
                  }
                />
              }
            </ProgressiveImage>
        }
        <div className={`cartItem__props col-9 ${ locked ? 'locked' : ''}`}>
          <p>{name}</p>
          <br/>
          <p>Qty: {quantity}</p>
          <p>Price: {displayCost(price, locale)}</p>
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
