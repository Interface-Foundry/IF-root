// react/components/App/Header.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Icon } from '../../../react-common/components';
import { calculateItemTotal, displayCost } from '../../utils';


const displayInvoice = (process.env.NODE_ENV === 'development') ? true : false

export default class Default extends Component {
  static propTypes = {
    push: PropTypes.func,
    cart: PropTypes.object,
    reorderCart: PropTypes.func,
    updateCart: PropTypes.func,
    createInvoice: PropTypes.func,
    selectTab: PropTypes.func,
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

  _handleInvoiceButton = () => {
    const { createInvoice, selectTab, cart, updateCart } = this.props;
    updateCart({ ...cart, locked: true });
    createInvoice(cart.id, 'mint', 'split_by_item');
    selectTab('invoice');
  }

  render() {
    const {
      cart,
      user,
      reorderCart,
      updateCart,
      selectTab,
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
                <button className='yellow sub' onClick={() => updateCart({ ...cart, locked: true })}> <a href={`/api/cart/${cart.id}/checkout`} target="_blank"> <Icon icon='Cart'/> <div className='text'>Checkout <span> {displayCost(total, cart.store_locale)} </span></div></a> </button>
              }

              { displayInvoice ? <button className='teal sub' onClick={::this._handleInvoiceButton}>INVOICE/LOVE TO STYLE CSS</button> : null }
            <button className='blue' onClick={::this._handleShare}> <Icon icon='Person'/> Share Cart </button>
          </span>
        }
      </div>
    );
  }
}
