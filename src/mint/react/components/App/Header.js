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
    currentUser: PropTypes.object,
    currentCart: PropTypes.object,
  }

  render() {
    const { props, props: { deals, currentUser, items, currentCart: { leader }, item: { search } } } = this,
    isLeader = leader && (leader.id === currentUser.id);
    return (
      <nav className='navbar'>
        <Route path={'/404'} exact component={() => 
              <IntroHead text={'Oh No!'} {...props}/>
            }
        />
        <Route path={'/cart/:cart_id/m/item/:index/:asin'} exact component={() => 
            <ModalHead text={'Add To Cart'} {...props}/>
          }
        />
        <Route path={'/cart/:cart_id/m/:type/:index/:asin/edit'} exact component={() => 
            <EnumeratedHead text={`${isLeader? '': 'My' } Cart Items`} length={isLeader ? items.length : splitCartById(this.props, {id: currentUser.id}).my ? splitCartById(this.props, {id: currentUser.id}).my.length : 0} type={'item'} {...props}/>
          }
        />
        <Route path={'/cart/:cart_id/m/variant/:index/:item_id'} exact component={() => 
            <ModalHead text={'Add to Cart'} {...props}/>
          }
        />
        <Route path={'/cart/:cart_id/m/deal/:index/:dealId'} exact component={() => 
            <EnumeratedHead text={'Daily Deals'} length={deals.length} type={'deal'} {...props}/>
          }
        />
        <Route path={'/cart/:cart_id/m/search/:index/:query'} exact component={() => 
            <EnumeratedHead text={'Search Results'} length={search ? search.length : 0} type={'search'} {...props}/>
          }
        />
        <Route path={'/cart/:cart_id/m/share'} exact component={() => 
            <ModalHead text={'Share Cart'} {...props}/>
          }
        />
        <Route path={'/cart/:cart_id/m/signin'} exact component={() => 
            <IntroHead text={'Add Item to Cart'} {...props}/>
          }
        />
        <Route path={'/cart/:cart_id/m/settings'} exact component={() => 
            <SettingsHeader text='Edit My Settings' icon="Settings" {...props}/>
          }
        />
        <Route path={'/cart/:cart_id/m/feedback'} exact component={() => 
            <SettingsHeader text='Feedback' icon="Email" {...props}/>
          }
        />
        <Route path={'/cart/:cart_id/m/edit'} exact component={() => 
            <ModalHead text={'Edit Cart'} {...props}/>
          }
        />
        <Route path={'/cart/:cart_id/m/edit/:cart_id'} exact component={() => 
            <ModalHead text={'Edit Cart'} {...props}/>
          }
        />
        <Route path={'/cart/:cart_id'} exact component={() => 
            <CartHead text={'Edit Cart'} {...props}/>
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
    isMobile: PropTypes.bool
  }

  state = {
    bounce: false
  }

  _bounceImage(e) {
    e.preventDefault();
    this.setState({ bounce: true });
    setTimeout(() => this.setState({ bounce: false }), 3000);
  }

  render() {
    const {
      state: { bounce },
      props: { currentUser: { name }, _toggleSidenav, cartName, isMobile, currentCart: { locked, cart_id, thumbnail_url, members } }
    } = this;

    return (
      <div>
        <div className='header__left'>
          <a href='#' onClick={(e)=>::this._bounceImage(e)}>
          {locked 
            ? <div className={`navbar__icon ${bounce ? 'bounce': ''}`}>
                <Icon icon='Locked'/>
              </div> 
            : <div className={`image ${bounce ? 'bounce': ''}`} style={
                {
                  backgroundImage: `url(${thumbnail_url ? thumbnail_url : '//storage.googleapis.com/kip-random/head%40x2.png)'})`,
                }
              }/>}
          <h3>
            {locked ? 'Checkout in Progress' : cartName}
          </h3>
          <span className='members'>Created by: {name} | {`${members.length} Members`}</span>
          </a>
        </div>
        <div className='header__right' onClick={_toggleSidenav}>
          {isMobile ? <div className='navbar__icon'><Icon icon='Hamburger'/></div> : <p><a href={`/cart/${cart_id}/m/settings`}>{name}</a></p>}
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
            backgroundImage: 'url(//storage.googleapis.com/kip-random/head%40x2.png)'
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
          <span>{text}</span>
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
          <span>{title}</span> - {itemIndex} of {length} {type === 'search' ? 'results' : null}
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
          <span className='underline'>{text}</span>
        </h3>
      </div>
    );
  }
}
