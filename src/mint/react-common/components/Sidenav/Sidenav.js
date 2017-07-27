// react/components/App/Sidenav.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import FlipMove from 'react-flip-move';
import LinkClass from './LinkClass';
import CartListItem from './CartListItem';
import { Icon } from '..';
import { moveToFront } from '../../utils';

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

  render = () => {
    const {
      props: { carts, archivedCarts, _toggleSidenav, user_account, cart_id, large },
      state: { show }
    } = this,
    SideNavLink = (window.location.pathname.includes('/cart') || window.location.pathname.includes('/m/') || window.location.pathname.includes('/newcart') || window.location.pathname.includes('/404'))
      ? Link
      : LinkClass,
      sortedCarts = carts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
      leaderCarts = moveToFront(
        sortedCarts
        .filter((c, i) => (c && c.leader && user_account) && (c.leader.id === user_account.id)),
        cart_id),
      memberCarts = moveToFront(
        sortedCarts
        .filter((c, i) => (c && c.leader && user_account) && (c.leader.id !== user_account.id)),
        cart_id);
    return (
      <div className={`sidenav ${(!window.location.pathname.includes('/cart') && !window.location.pathname.includes('/newcart') && !window.location.pathname.includes('/404')) ? 'homesidenav' : 'cartsidenav'}`}>
        <div className='sidenav__overlay' onClick={() => _toggleSidenav()}>
        </div>
        <ul className={`sidenav__list ${large ? 'large' : ''}`}>
          <li className='sidenav__list__header'>
            <div className='icon' onClick={() => _toggleSidenav()}>
              <Icon icon='Clear'/>
            </div>
          </li>
          <li className='sidenav__list__view'>
            <div className='sidenav__list__title'>
              { user_account.name ? <h4 className='name'> <Link to={'/m/settings'}><span>{user_account.name}</span></Link> </h4> : '' }
              <br></br>
              { leaderCarts.length ? <h4>My Kip Carts</h4> : null }
            </div>
            <FlipMove typeName="ul" duration={350} staggerDurationBy={30} easing="cubic-bezier(0.4, 0, 0.2, 1)"  enterAnimation="elevator" leaveAnimation="elevator">
              {
                leaderCarts.map((c, i) =>
                  (i > 3 && show !== 'me')
                  ? null
                  : <CartListItem key={c.id} cart={c} currentCartId={cart_id} SideNavLink={SideNavLink} isLeader={true}/>)
              }
              {
                leaderCarts.length >= 4
                 ? (<h4 className='show__more' key='show_more_leader'
                      onClick={() => show !== 'me' ? this.setState({show: 'me'}) : this.setState({show: null})}>
                      <Icon icon={show === 'me' ? 'Up' : 'Down'}/>
                      &nbsp; {show === 'me' ? 'Less' : 'More'}
                  </h4>)
                : null
              }
            </FlipMove>

            { memberCarts.length ? <h4>Other Kip Carts</h4> : null }
            <FlipMove typeName="ul" duration={350} staggerDurationBy={30} easing="cubic-bezier(0.4, 0, 0.2, 1)"  enterAnimation="elevator" leaveAnimation="elevator">
              {
                memberCarts.map((c, i) =>
                (i > 3 && show !== 'other')
                 ? null
                 : <CartListItem key={c.id} cart={c} currentCartId={cart_id} SideNavLink={SideNavLink} isLeader={false}/>)
              }
              {
                memberCarts.length >= 4 ? <h4 className='show__more' key='show_more_member' onClick={() => show !== 'other' ? this.setState({show: 'other'}) : this.setState({show: null})}>
                <Icon icon={show === 'other' ? 'Up' : 'Down'}/>
                  &nbsp; {show === 'other' ? 'Less' : 'More'}
                </h4> : null
              }
            </FlipMove>

          </li>
          <li className='sidenav__list__actions'>
            {
              archivedCarts.length
              ? <SideNavLink className='lock' to={'/m/archive'}><Icon icon='Locked'/><h4>Archives</h4></SideNavLink>
              : null
            }
            {user_account.name ? <SideNavLink className='settings' to={'/m/settings'}><Icon  icon='Settings'/><h4>Settings</h4></SideNavLink> : null }
            <SideNavLink className='mail' to={'/m/feedback'}><Icon  icon='Email'/><h4>Feedback</h4></SideNavLink>
          </li>
          <footer className='sidenav__footer'>
            <a href={`/cart/${cart_id}/m/share`} onClick={(e)=> {e.preventDefault(); _toggleSidenav(); this._handleShare();}}>
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