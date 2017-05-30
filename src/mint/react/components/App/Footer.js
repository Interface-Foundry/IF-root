// react/components/App/Footer.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';
import { calculateItemTotal, displayCost } from '../../utils';
import { Icon } from '../../../react-common/components';
import { ModifyContainer } from '../../containers';

export default class Footer extends Component {
  static propTypes = {
    leader: PropTypes.object,
    cart_id: PropTypes.string,
    item: PropTypes.object,
    addItem: PropTypes.func,
    match: PropTypes.object,
  }

  render() {
    const { props, props: { item: { id: item_id } } } = this;
    return (
      <footer className='footer'>
        <Route path={'/cart/:cart_id/m/item/add'} exact component={() => <div className='empty'/>}/>
        <Route path={'/cart/:cart_id/m/share'} exact component={() => <div className='empty'/>}/>
        <Route path={'/cart/:cart_id/m/item/:index/:item_id'} exact component={() => <ItemFooter {...props} item_id={item_id}/>}/>
        <Route path={'/cart/:cart_id/m/variant/:index/:item_id'} exact component={() => <ItemFooter {...props} item_id={item_id}/>}/>
        <Route path={'/cart/:cart_id/m/cartVariant/:index/:item_id'} exact component={()=> <ModifyContainer item_id={item_id} {...props}/>}/>
        <Route path={'/cart/:cart_id/m/:type/:index/:item_id/edit'} exact component={() => <EditFooter {...props} item_id={item_id}/>}/>
        <Route path={'/cart/:cart_id/m/edit'} exact component={() => <div className='empty'/>}/>
        <Route path={'/cart/:cart_id/m/settings'} exact component={() => <SettingsFooter {...props} item_id={item_id}/>}/>
        <Route path={'/cart/:cart_id/m/deal/:index/:item_id'} exact component={() => <ItemFooter {...props} item_id={item_id}/>}/>
        <Route path={'/cart/:cart_id/m/search/:index/:search'} exact component={() => <ItemFooter {...props} item_id={item_id}/>}/>
        <Route path={'/cart/:cart_id'} exact component={() => <CartFooter {...props}/>}/>
      </footer>
    );
  }
}

class CartFooter extends Component {
  static propTypes = {
    history: PropTypes.object,
    cart_id: PropTypes.string,
    updateCart: PropTypes.func,
    currentCart: PropTypes.object,
    user_account: PropTypes.object,
    leader: PropTypes.object
  }

  _handleShare = () => {
    const { history: { replace }, cart_id } = this.props;

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
      replace(`/cart/${cart_id}/m/share`)
    }
  }

  render() {
    const { _handleShare } = this, { updateCart, checkoutCart, cart_id, currentCart, currentCart: { locked }, user_account, leader, items, isMobile, history: { replace, push } } = this.props;
    const isLeader = !!user_account.id && !!leader && (leader.id === user_account.id);
    const total = calculateItemTotal(items);
    const locale = currentCart.store ? currentCart.store.includes('amazon') ? (currentCart.store_locale === 'UK' ? 'GBP' : 'USD') : 'GBP' : null;
    if (locked) {
      return (
        <div className='footer__cart'>
          <button className='green' onClick={() => replace(`/cart/${cart_id}/m/feedback`)}>
            <Icon icon='Email'/>
            FEEDBACK
          </button>
          <a
            className={items.length===0 ? 'disabled':''}
            href={`/api/cart/${cart_id}/checkout`}
            onClick={
              (e) => {
                e.preventDefault();
                if (items.length > 0) {
                  if(currentCart.store === 'ypo'){
                    push(`/cart/${currentCart.id}/address`)
                  }
                  else {
                    if(isLeader) updateCart({...currentCart, locked: !currentCart.locked});
                    window.open(`/api/cart/${cart_id}/checkout`);
                  }
                }
              }
            }
          >
            <button disabled={items.length===0} className='checkout'>
              <Icon icon='Cart'/>
              <h4>Checkout<br/>{displayCost(total, locale)}</h4>
            </button>
          </a>
        </div>
      );
    }
    return (
      <div className='footer__cart'>
        <button className='share' onClick={_handleShare}>
          <Icon icon='Person'/>
          <h4>Share</h4>
        </button>
        <a
          className={items.length === 0 ? 'disabled':''}
          href={`/api/cart/${cart_id}/checkout`}
          onClick={
            (e) => {
              e.preventDefault();
              if (items.length > 0) {
                  if(currentCart.store === 'ypo'){
                    push(`/cart/${currentCart.id}/address`)
                  }
                  else {
                    if(isLeader) updateCart({...currentCart, locked: !currentCart.locked});
                    window.open(`/api/cart/${cart_id}/checkout`);
                  }
                }
            }
          }
        >
          <button disabled={items.length === 0} className='checkout'>
            <Icon icon='Cart'/>
            <h4>Checkout<br/>{displayCost(total, locale)}</h4>
          </button>
        </a>
      </div>
    );
  }
}

class ItemFooter extends Component {
  static propTypes = {
    cart_id: PropTypes.string,
    item: PropTypes.object,
    addItem: PropTypes.func.isRequired,
    history: PropTypes.object,
    position: PropTypes.number,
    removeDeal: PropTypes.func,
    item_id: PropTypes.string,
    user_account: PropTypes.object
  }

  render() {
    const { removeDeal, addItem, _togglePopup, item_id, position, cart_id, clearItem, user_account, history: { replace, location: { pathname } } } = this.props,
      removeItem = pathname.includes('deal');

    return (
      <footer className='footer__item'>
        <button className='cancel dimmed' onClick={()=> {replace(`/cart/${cart_id}/`);}}>Cancel</button>
        { !!user_account.id ? 
          <button className='add triple' onClick={() => {addItem(cart_id, item_id, replace); clearItem(); replace(`/cart/${cart_id}/`); removeItem ? removeDeal(position) : null;}}>✓ Save to Cart</button> 
          : <button className='add triple' onClick={() => _togglePopup()}>✓ Save to Cart</button> 
        }
      </footer>
    );
  }
}

class EditFooter extends Component {
  static propTypes = {
    cart_id: PropTypes.string,
    removeItem: PropTypes.func,
    item_id: PropTypes.string,
    history: PropTypes.object
  }

  render() {
    const { cart_id, item_id, history: { push, replace }, removeItem } = this.props;
    return (
      <footer className='footer__save'>
        <button className='remove dimmed' onClick={()=> {removeItem(cart_id, item_id); replace(`/cart/${cart_id}/`);}}>Remove Item</button>
        <button className='save triple' onClick={() =>push(`/cart/${cart_id}/`)}>✓ Update</button>
      </footer>
    );
  }
}

class SettingsFooter extends Component {
  static propTypes = {
    logout: PropTypes.func
  }

  render() {
    const { logout } = this.props;
    return (
      <footer className='footer__settings'>
        <button className='logout' onClick={logout}><Icon icon='Logout'/>Logout</button> 
      </footer>
    );
  }
}