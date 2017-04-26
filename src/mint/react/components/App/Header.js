// react/components/App/Header.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';
import { Icon } from '..';
import { splitCartById } from '../../reducers';

export default class Header extends Component {
  static propTypes = {
    item: PropTypes.object,
    items: PropTypes.arrayOf(PropTypes.object),
    deals: PropTypes.arrayOf(PropTypes.object),
    currentUser: PropTypes.object
  }

  render() {
    let { props, props: { deals, items, currentUser, item: { search } } } = this;
    const { match } = props;
    search = search ? search : 0;

    return (
      <nav className='navbar'>
        <Route path={`${match.url}/m/item/:index/:asin`} component={() => 
            <EnumeratedHead text={'My Cart Items'} length={items.length} type={'item'} {...props}/>
          }
        />
        {/* TODO: get this working for admins */}
        <Route path={`${match.url}/m/:type/:index/:asin/edit`} component={() => 
            <EnumeratedHead text={'My Cart Items'} length={splitCartById(this.props, {id: currentUser.id}).my ? splitCartById(this.props, {id: currentUser.id}).my.length : 0} type={'item'} {...props}/>
          }
        />
        <Route path={`${match.url}/m/item`} component={() => 
            <ModalHead text={'Add to Cart'} {...props}/>
          }
        />
        <Route path={`${match.url}/m/variant/:index/:item_id`} component={() => 
            <ModalHead text={'Add to Cart'} {...props}/>
          }
        />
        <Route path={`${match.url}/m/deal/:index/:dealId`} component={() => 
            <EnumeratedHead text={'Daily Deals'} length={deals.length} type={'deal'} {...props}/>
          }
        />
        <Route path={`${match.url}/m/search/:index/:query`} component={() => 
            <EnumeratedHead text={'Search Results'} length={search.length||0} type={'search'} {...props}/>
          }
        />
        <Route path={`${match.url}/m/share`} component={() => 
            <ModalHead text={'Share Cart'} {...props}/>
          }
        />
        <Route path={`${match.url}/m/settings`} component={() => 
            <SettingsHeader text='Settings' icon="Settings" {...props}/>
          }
        />
        <Route path={`${match.url}/m/feedback`} component={() => 
            <SettingsHeader text='Feedback' icon="Email" {...props}/>
          }
        />
        <Route path={`${match.url}/m/edit`} component={() => 
            <ModalHead text={'Edit Cart'} {...props}/>
          }
        />
        <Route path={`${match.url}`} exact component={() => 
            <CartHead {...props}/>
          }
        />
      </nav>
    );
  }
}

class CartHead extends Component {
  static propTypes = {
    cartName: PropTypes.string,
    _toggleSidenav: PropTypes.func,
    currentUser: PropTypes.object,
    currentCart: PropTypes.object,
  }

  render() {
    const { _toggleSidenav, currentUser, cartName, currentCart: { locked, thumbnail_url } } = this.props;

    return (
      <div>
        {locked ? <div className='navbar__icon'>
            <Icon icon='Locked'/>
          </div> : <div className='image' style={
          {
            backgroundImage: `url(${thumbnail_url ? thumbnail_url : 'http://tidepools.co/kip/head@x2.png'})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain'
          }}/>}
        <h3>
          {locked ? 'Checkout in progress' : cartName}
        </h3>
        {
          currentUser.id ? <div className='navbar__icon' onClick={_toggleSidenav}>
            <Icon icon='Hamburger'/>
          </div> : <div className='navbar__icon no-pointer'/>
        }
      </div>
    );
  }
}

class ModalHead extends Component {
  static propTypes = {
    cart_id: PropTypes.string,
    history: PropTypes.object,
    text: PropTypes.string.isRequired
  }

  render() {
    const { cart_id, history: { replace }, text } = this.props;
    return (
      <div className='navbar__modal'>
        <div className='navbar__icon__close' onClick={()=>replace(`/cart/${cart_id}/`)}>
          <Icon icon='Clear'/>
        </div>
        <h3 className='navbar__modal_head'>
          {text}
        </h3>
        <div className='navbar__icon no-pointer'/>
      </div>
    );
  }
}

class EnumeratedHead extends Component {
  static propTypes = {
    cart_id: PropTypes.string,
    history: PropTypes.object,
    deals: PropTypes.array,
    text: PropTypes.string,
    location: PropTypes.object,
    items: PropTypes.array,
    length: PropTypes.number,
    type: PropTypes.string
  }

  render() {
    const { cart_id, length, type, history: { replace, location: { pathname } }, text } = this.props,
      itemIndex = parseInt(pathname.match(/\/(\d+)\//i)[1]) + 1,
      query = pathname.match(/\/\d\/(.+)$/i)[1],
      title = type === 'search' ? `"${query}"` : text;
    return (
      <div className='navbar__modal'>
        <div className='navbar__icon__close' onClick={() => replace(`/cart/${cart_id}/`)}>
          <Icon icon='Clear'/>
        </div>
        <h3 className='navbar__modal_head'>
          {title} - {itemIndex} of {length} {type === 'search' ? 'results' : null}
        </h3>
        <div className='navbar__icon no-pointer'/>
      </div>
    );
  }
}

class SettingsHeader extends Component {
  static propTypes = {
    cart_id: PropTypes.string,
    history: PropTypes.object,
  }

  render() {
    const { cart_id, history: { replace }, text, icon } = this.props;

    return (
      <div className='navbar__modal settings'>
        <div className='navbar__icon__close' onClick={() => replace(`/cart/${cart_id}/`)}>
          <Icon icon='Left'/>
        </div>
        <h3 className='navbar__modal_head settings'>
          <Icon icon={icon}/>
          {text}
        </h3>
      </div>
    );
  }
}
