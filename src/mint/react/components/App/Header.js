// react/components/App/Header.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';
import { Icon } from '..';
import { splitCartById } from '../../reducers';
import { getNameFromEmail } from '../../utils';

export default class Header extends Component {
  static propTypes = {
    item: PropTypes.object,
    items: PropTypes.arrayOf(PropTypes.object),
    deals: PropTypes.arrayOf(PropTypes.object),
    currentUser: PropTypes.object,
    currentCart: PropTypes.object,
  }

  render() {
    let { props, props: { deals, currentUser, items, currentCart: { leader }, item: { search } } } = this;
    const { match } = props,
    isLeader = leader && (leader.id === currentUser.id);
    search = search ? search : 0;

    return (
      <nav className='navbar'>
        <Route path={`${match.url}/m/item/:index/:asin`} component={() => 
            <ModalHead text={'Add To Cart'} {...props}/>
          }
        />
        {/* TODO: get this working for admins */}
        <Route path={`${match.url}/m/:type/:index/:asin/edit`} component={() => 
            <EnumeratedHead text={`${isLeader? '': 'My' } Cart Items`} length={isLeader ? items.length : splitCartById(this.props, {id: currentUser.id}).my ? splitCartById(this.props, {id: currentUser.id}).my.length : 0} type={'item'} {...props}/>
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
        <Route path={`${match.url}/m/signin`} component={() => 
            <IntroHead text={'Create New Cart'} {...props}/>
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
    const { isMobile, currentUser: { name }, _toggleSidenav, cartName, cart_id, currentCart: { locked, thumbnail_url } } = this.props;

    return (
      <div>
        <div className='header__left'>
          <a href={`/cart/${cart_id}`}>
          {locked ? <div className='navbar__icon'>
              <Icon icon='Locked'/>
            </div> : <div className='image' style={
            {
              backgroundImage: `url(${thumbnail_url})`,
            }
          }/>}
          <h3>
            {locked ? 'Checkout in progress' : cartName}
          </h3>
          </a>
        </div>
        <div className='header__right' onClick={_toggleSidenav}>
          {isMobile ? <div className='navbar__icon'><Icon icon='Hamburger'/></div> : <p>{name}</p>}
        </div>
      </div>
    );
  }
}

class IntroHead extends Component {
  static propTypes = {
    text: PropTypes.string
  }

  render() {
    const { text } = this.props;
    return (
      <div className="header__left">
        <div className='image' style={
          {
            backgroundImage: 'url(https://storage.googleapis.com/kip-random/head%40x2.png)'
          }
        }/>
        <h3>
          {text}
        </h3>
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
