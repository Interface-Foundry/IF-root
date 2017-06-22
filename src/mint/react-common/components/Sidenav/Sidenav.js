// react/components/App/Sidenav.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import LinkClass from './LinkClass';
import moment from 'moment';
import { Icon } from '..';

export default class Sidenav extends Component {
  static propTypes = {
    cart_id: PropTypes.string,
    user_account: PropTypes.object.isRequired,
    leader: PropTypes.object,
    currentCart: PropTypes.object,
    carts: PropTypes.arrayOf(PropTypes.object),
    archivedCarts: PropTypes.arrayOf(PropTypes.object),
    _toggleSidenav: PropTypes.func.isRequired,
    large: PropTypes.bool,
    push: PropTypes.func
  }

  state = {
    show: null
  }

  _handleShare = () => {
    const { push, cart_id } = this.props;
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
      push(`/cart/${cart_id}/m/share`);
    }
  }

  // moves cart with id to front of list
  // Cool function, try to put stuff like this in the utilities folder so we can use it in other places.
  _moveToFront(carts, id) {
    return carts.reduce((acc, cart) => {
      if (cart.id === id) return [cart, ...acc];
      else return [...acc, cart];
    }, []);
  }

  render() {
    const {
      _moveToFront,
      props: { carts, archivedCarts, _toggleSidenav, user_account, cart_id, large },
      state: { show }
    } = this;

    const SideNavLink = (!window.location.pathname.includes('/cart') && !window.location.pathname.includes('/newcart') && !window.location.pathname.includes('/404')) ? LinkClass : Link;

    let leaderCarts = _moveToFront(
        carts.filter((c, i) => (c && c.leader && user_account) && (c.leader.id === user_account.id)),
        cart_id),
      memberCarts = _moveToFront(
        carts.filter((c, i) => (c && c.leader && user_account) && (c.leader.id !== user_account.id)),
        cart_id);

    // https://www.amazon.com/dp/B01GF5AGN4/ref=sr_1_6
    return (
      <div className={`sidenav ${(!window.location.pathname.includes('/cart') && !window.location.pathname.includes('/newcart') && !window.location.pathname.includes('/404')) ? 'homesidenav' : 'cartsidenav'}`}>
        <div className='sidenav__overlay' >
        </div>
        <ul className={`sidenav__list ${large ? 'large' : ''}`}>
          <li className='sidenav__list__header'>
            <div className='icon' >
              <Icon icon='Clear'/>
            </div>
          </li>
          <li className='sidenav__list__view'>
            <div className='sidenav__list__title'>
              { user_account.name ? <h4 className='name'> <Link to={`/cart/${cart_id}/m/settings`}><span>{user_account.name}</span></Link> </h4> : '' } 
              { leaderCarts.length ? <h4>My Kip Carts</h4> : null }
            </div>
            <ul>
              {leaderCarts.map((c, i) => {
                if(i > 2 && show !== 'me') return null;
                return ( 
                  <li key={i} className={`sidenav__list__leader ${c.id === cart_id ? 'currentCart' : ''}`} >
                    <div className={'image'} style={{
                      backgroundImage: `url(${c.thumbnail_url ? c.thumbnail_url : '//storage.googleapis.com/kip-random/kip_head_whitebg.png'})`
                    }}/>
                    <SideNavLink to={`/cart/${c.id}`}>
                      <p>
                        {c.name ? c.name : `${c.leader.name ? c.leader.name + '\'s ' : ''}Kip Cart`}
                        {c.locked ? <span><br/>{moment(c.updatedAt).format('L')}</span> : null}
                        {!c.locked ? <span><br/>{c.store} {c.store_locale}</span> : null}
                      </p>
                    </SideNavLink>
                  </li>
                );
              })}
            </ul>
            {
              leaderCarts.length >= 4 ? <h4 className='show__more' onClick={() => show !== 'me' ? this.setState({show: 'me'}) : this.setState({show: null})}>
              <Icon icon={show === 'me' ? 'Up' : 'Down'}/>
                &nbsp; {show === 'me' ? 'Less' : 'More'}
              </h4> : null
            }
            { memberCarts.length ? <h4>Other Kip Carts</h4> : null }
            <ul>
              {memberCarts.map((c, i) => {
                if(i > 2 && show !== 'other') return null;
                return (
                  <li key={i} className={`sidenav__list__leader ${c.id === cart_id ? 'currentCart' : ''}`} >
                    <div className='icon'>
                    </div>
                    <SideNavLink to={`/cart/${c.id}`}>
                      <p>{c.name ? c.name : `${c.leader.name ? c.leader.name + '\'s ' : ''}Kip Cart`}</p>
                    </SideNavLink>
                  </li>
                );
              })}
            </ul>
            {
              memberCarts.length >= 4 ? <h4 className='show__more' onClick={() => show !== 'other' ? this.setState({show: 'other'}) : this.setState({show: null})}>
              <Icon icon={show === 'other' ? 'Up' : 'Down'}/>
                &nbsp; {show === 'other' ? 'Less' : 'More'}
              </h4> : null
            }
          </li>
          <li className='sidenav__list__actions'>
            {
              archivedCarts.length
              ? <SideNavLink to={`/cart/${cart_id}/m/archive`} ><h4><Icon icon='Archive'/> Archived Carts</h4></SideNavLink>
              : null
            }
            {user_account.name ? <SideNavLink to={`/cart/${cart_id}/m/settings`} ><h4><Icon icon='Settings'/> My Settings</h4></SideNavLink> : null }
            <SideNavLink to={`/cart/${cart_id}/m/feedback`} ><h4><Icon icon='Email'/>Feedback</h4></SideNavLink>
          </li>
          <footer className='sidenav__footer'>
            <a href={`/cart/${cart_id}/m/share`} onClick={(e)=> {e.preventDefault(); _toggleSidenav(); ::this._handleShare();}}>
              <button className='side__share'>
                <Icon icon='Person'/>
                <p>Add Others To Cart</p> 
              </button>
            </a>
            <a href={'/newcart'}>
              <button className='side__new_cart'>
                <Icon icon='Add'/>
                <p>Create New Cart</p>
              </button>
            </a>
          </footer>
        </ul>
      </div>
    );
  }
}
