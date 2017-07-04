// react/components/App/Header.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Icon } from '../../../react-common/components';
import { calculateItemTotal, displayCost } from '../../utils';

export default class Default extends Component {
  static propTypes = {
    push: PropTypes.func,
    cart: PropTypes.object,
    reorderCart: PropTypes.func,
    updateCart: PropTypes.func,
    user: PropTypes.object
  }

  _handleShare = () => {
    const { push, cart } = this.props;

    // TRY THIS FIRST FOR ANY BROWSER
    if (navigator.share !== undefined) {
      navigator.share({
          title: 'Kip Cart',
          text: 'Cart Name',
          url: 'cart.kipthis.com/URL'
        })
        .then(() => console.log('Successful share'))
        .catch(error => console.log('Error sharing:', error));
    } else {
      push(`/cart/${cart.id}/m/share`);
    }
  }

  render() {
    const {
      cart,
      user,
      reorderCart,
      updateCart
    } = this.props,
      total = calculateItemTotal(cart.items);
    
    return (
      <div className='default'>
        {
          cart.locked ? <span>
            <button className='yellow sub' onClick={() => reorderCart(cart.id)}> Re-Order {displayCost(total, cart.store_locale)} </button>
            { cart.leader.id === user.id || cart.leader === user.id ? <button className='locked' onClick={() => updateCart({ ...cart, locked: false })}> <Icon icon='Locked'/> Unlock </button> : null }
          </span> : <span>
            {
              cart.items.length === 0 ? 
                <button className='yellow sub' disabled={true} > Checkout <span>{displayCost(total, cart.store_locale)} </span></button> : 
                <button className='yellow sub' onClick={() => user.id === cart.leader.id ? updateCart({ ...cart, locked: true }) : null}> <a href={`/api/cart/${cart.id}/checkout`} target="_blank"> <Icon icon='Cart'/> <div className='text'><span> {displayCost(total, cart.store_locale)} </span> <p>Checkout</p> </div><Icon icon='RightChevron'/></a> </button> 
              }
            <button className='blue' onClick={::this._handleShare}> <Icon icon='Person'/> Share Cart </button>
          </span>
        }
      </div>
    );
  }
}
