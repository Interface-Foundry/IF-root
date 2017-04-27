// react/components/App/Footer.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';
import { calculateItemTotal, displayCost } from '../../utils';
import { Icon } from '..';

export default class Footer extends Component {
  static propTypes = {
    leader: PropTypes.object,
    cart_id: PropTypes.string,
    item: PropTypes.object,
    addItem: PropTypes.func,
    match: PropTypes.object,
  }

  render() {
    const { props, props: { match, item: { id: item_id } } } = this;
    return (
      <footer className='footer'>
        <Route path={`${match.url}/m/item/add`} component={() => <div className='empty'/>}/>
        <Route path={`${match.url}/m/share`} component={() => <div className='empty'/>}/>
        <Route path={`${match.url}/m/signin`} component={() => <SignInFooter/>}/>
        <Route path={`${match.url}/m/item/:index/:item_id`} exact component={() => <ItemFooter {...props} item_id={item_id}/>}/>
        <Route path={`${match.url}/m/variant/:index/:item_id`} exact component={() => <ItemFooter {...props} item_id={item_id}/>}/>
        <Route path={`${match.url}/m/:type/:index/:item_id/edit`} component={() => <EditFooter {...props} item_id={item_id}/>}/>
        <Route path={`${match.url}/m/edit`} component={() => <div className='empty'/>}/>
        <Route path={`${match.url}/m/settings`} component={() => <SettingsFooter {...props} item_id={item_id}/>}/>
        <Route path={`${match.url}/m/deal/:index/:item_id`} component={() => <ItemFooter {...props} item_id={item_id}/>}/>
        <Route path={`${match.url}/m/search/:index/:search`} component={() => <ItemFooter {...props} item_id={item_id}/>}/>
        <Route path={`${match.url}`} exact component={() => <CartFooter {...props}/>}/>
      </footer>
    );
  }
}

class SignInFooter extends Component {
  render() {
    return (
      <p className='tos'>
        By signing up you agree to the Kip <a href='https://kipthis.com/legal/'>Terms of Use</a>
      </p>
    );
  }
}

class CartFooter extends Component {
  static propTypes = {
    history: PropTypes.object,
    cart_id: PropTypes.string,
    updateCart: PropTypes.func,
    currentCart: PropTypes.object,
    currentUser: PropTypes.object,
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
    const { _handleShare } = this, { updateCart, checkoutCart, cart_id, currentCart, currentCart: { locked }, currentUser, leader, items } = this.props;
    const isLeader = !!currentUser.id && !!leader && (leader.id === currentUser.id);
    const total = calculateItemTotal(items);

    if (locked) {
      return (
        <div className='footer__cart'>
          <button className='green'>
            <Icon icon='Email'/>
            FEEDBACK
          </button>
          {
            isLeader
            ? <button className='share'>
                <Icon icon='Cart'/>
                EMAIL ITEMS
              </button>
            : null
          }
        </div>
      );
    }
    return (
      <div className='footer__cart'>
        <button className='share' onClick={_handleShare}>
          <Icon icon='Person'/>
          <h4>SHARE</h4>
        </button>
        {
          isLeader
          ? <a target="_blank" href={`/api/cart/${cart_id}/checkout`}><button className='checkout' onClick={() => {updateCart({...currentCart, locked: !currentCart.locked}); checkoutCart(cart_id)}}>
              <Icon icon='Cart'/>
              <h4>CHECKOUT<br/>{displayCost(total)}</h4>
            </button>
            </a>
          : null
        }
      </div>
    );
  }
}

class ItemFooter extends Component {
  static propTypes = {
    cart_id: PropTypes.string,
    item: PropTypes.object,
    addItem: PropTypes.func.isRequired,
    item_id: PropTypes.string,
    history: PropTypes.object,
    position: PropTypes.number,
    removeDeal: PropTypes.func
  }

  render() {
    const { removeDeal, addItem, item_id, position, cart_id, history: { replace, location: { pathname } } } = this.props,
      removeItem = pathname.includes('deal');

    return (
      <footer className='footer__item'>
        <button className='cancel dimmed' onClick={()=> {replace(`/cart/${cart_id}/`);}}>Cancel</button>
        <button className='add triple' onClick={() => {addItem(cart_id, item_id, replace); replace(`/cart/${cart_id}/`); removeItem ? removeDeal(position) : null;}}>Add to Cart</button>
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
    cart_id: PropTypes.string
  }

  render() {
    const { cart_id, history: { push, replace }, removeItem, logout } = this.props;

    return (
      <footer className='footer__settings'>
        <button className='logout' onClick={() => {logout(); replace(`/cart/${cart_id}/`);}}>Logout</button>
      </footer>
    );
  }
}
