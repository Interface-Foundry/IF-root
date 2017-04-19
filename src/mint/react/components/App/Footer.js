import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';

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
        <Route path={`${match.url}/m/signin`} component={() => <div className='empty'/>}/>
        <Route path={`${match.url}/m/item/:index/:item_id`} component={() => <ItemFooter {...props} item_id={item_id}/>}/>
        <Route path={`${match.url}/m/deal/:index/:item_id`} component={() => <ItemFooter {...props} item_id={item_id}/>}/>
        <Route path={`${match.url}/m/search/:index/:search`} component={() => <ItemFooter {...props} item_id={item_id}/>}/>
        <Route path={`${match.url}`} exact component={() => <CartFooter {...props}/>}/>
      </footer>
    );
  }

}

class CartFooter extends Component {
  static propTypes = {
    history: PropTypes.object,
    cart_id: PropTypes.string,
    updateCart: PropTypes.func,
    currentCart: PropTypes.object
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
    const { _handleShare } = this, { updateCart, currentCart } = this.props;

    return (
      <div className='footer__cart'>
        <button className='share' onClick={_handleShare}>SHARE</button>
        <button onClick={() => {
          updateCart({
            ...currentCart, 
            locked: !currentCart.locked
          });
        }}>CHECKOUT</button>
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
    history: PropTypes.object
  }

  render() {
    const { addItem, item_id, cart_id, history: { replace } } = this.props;

    return (
      <footer className='item__footer'>
        <button onClick={() => addItem(cart_id, item_id, replace)}>Add to Cart</button>
      </footer>
    );
  }
}
