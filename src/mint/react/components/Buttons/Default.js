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
    createInvoice: PropTypes.func,
    selectTab: PropTypes.func,
    user: PropTypes.object,
    toggleYpoCheckout: PropTypes.func,
    checkoutOnly: PropTypes.bool,
    toggleCheckoutModal: PropTypes.func,
    checkoutFunc: PropTypes.func
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

  _handleUnlockCart = () => {
    const { updateCart, cart } = this.props;
    updateCart({ ...cart, locked: false });
  }

  _orderCart = (e) => {
    if (this.props.checkoutFunc) return this.props.checkoutFunc(e);
    const { cart, cart: { locked, store, id, leader }, user, reorderCart, toggleYpoCheckout, updateCart, toggleCheckoutModal } = this.props;
    if (leader.id === user.id) updateCart({ ...cart, locked: true });

    if (store === 'YPO') toggleYpoCheckout();
    else if (KIP_PAY_ENABLED) toggleCheckoutModal(true);
    else {
      if (locked) reorderCart(id);
      window.open(`/api/cart/${id}/checkout`);
    }
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
              <button className='yellow sub' onClick={this._orderCart} type='submit'>
                <span className='inner-button'>
                  <Icon icon='Cart'/>
                  <p className='checkout-button-text'>Checkout</p>
                  <p className='checkout-button-text'>{displayCost(total, cart.price_locale)}</p>
                  <Icon icon='RightChevron'/>
                </span>
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
                    Checkout <span>{displayCost(total, cart.price_locale)}</span>
                  </button>
                :
                  <button className='yellow sub' onClick={this._orderCart} type='submit'>
                    <span className='inner-button'>
                      <Icon icon='Cart'/>
                      <p className='checkout-button-text'>Checkout</p>
                      <p className='checkout-button-text'>{displayCost(total, cart.price_locale)}</p>
                      <Icon icon='RightChevron'/>
                    </span>
                  </button>
                }
              {!checkoutOnly ? <button className='blue' onClick={this._handleShare}> <Icon icon='Person'/> Share Cart </button> :null}
            </span>
          }

      </div>
    );
  }
}