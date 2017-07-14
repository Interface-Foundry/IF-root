// react/components/App/Header.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Icon } from '../../../react-common/components';
import { calculateItemTotal, displayCost } from '../../utils';

const displayInvoice = (process.env.NODE_ENV === 'development') || process.env.KIP_PAY_ENABLED ? true : false;

export default class Default extends Component {
  static propTypes = {
    push: PropTypes.func,
    cart: PropTypes.object,
    reorderCart: PropTypes.func,
    updateCart: PropTypes.func,
    createInvoice: PropTypes.func,
    selectTab: PropTypes.func,
    user: PropTypes.object,
    toggleYpoCheckout: PropTypes.func,
    checkoutOnly: PropTypes.bool,
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

  _handleUnlockCart = () => {
    const { updateCart, cart } = this.props;
    updateCart({ ...cart, locked: false });
  }

  _orderCart = (e) => {
    const { cart: { locked, store, id, leader }, user, reorderCart, toggleYpoCheckout, updateCart } = this.props;
    if (store === 'YPO') toggleYpoCheckout(true);
    else if (locked) reorderCart(id);

    if (leader.id === user.id) updateCart({ id, locked: true });
    if (store !== 'YPO') window.open(`/api/cart/${id}/checkout`);
  }

  render() {
    const {
      props: { cart, user, updateCart, checkoutOnly = false }
    } = this,
    total = calculateItemTotal(cart.items);
    return (
      <div className='default'>
        {

          cart.locked
          ? <span>
              <button
                className='yellow sub lock'
                onClick={::this._orderCart}
                >
                  Re-Order {displayCost(total, cart.store_locale)}
                </button>

                  {
                    (cart.leader.id === user.id || cart.leader === user.id) && !checkoutOnly
                    ? <button className='locked' onClick={() => updateCart({ ...cart, locked: false })}>
                        <Icon icon='Unlocked'/>Unlock Cart
                      </button>
                    : null
                  }
              </span>
            : <span>
              {
                cart.items.length === 0
                ?
                  <button className='yellow sub' disabled={true}>
                    Checkout <span>{displayCost(total, cart.store_locale)}</span>
                  </button>
                :
                  <button className='yellow sub' onClick={::this._orderCart}>
                    <a href={`/api/cart/${cart.id}/checkout`} target="_blank" onClick={(e)=>e.preventDefault()}>
                      <Icon icon='Cart'/>
                      <p>Checkout</p>
                      <p>{displayCost(total, cart.store_locale)}</p>
                      <Icon icon='RightChevron'/>
                    </a>
                  </button>
                }
              {displayInvoice && !checkoutOnly && (cart.items.length > 0)? <button className='teal sub' onClick={::this._handleInvoiceButton}>INVOICE/LOVE TO STYLE CSS</button> : null }
              {!checkoutOnly ? <button className='blue' onClick={::this._handleShare}> <Icon icon='Person'/> Share Cart </button> :null}
            </span>
          }

      </div>
    );
  }
}
