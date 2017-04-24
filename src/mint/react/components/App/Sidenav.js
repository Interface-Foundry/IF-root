import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { getNameFromEmail } from '../../utils';
import { Icon } from '..';

export default class Sidenav extends Component {
  static propTypes = {
    cart_id: PropTypes.string,
    leader: PropTypes.object,
    carts: PropTypes.arrayOf(PropTypes.object),
    _toggleSidenav: PropTypes.func.isRequired,
    currentUser: PropTypes.object.isRequired
  }

  render() {
    const { carts, _toggleSidenav, currentUser, cart_id } = this.props,
      leaderCarts = _.filter(carts, (c) => c.leader.email_address === currentUser.email_address),
      memberCarts = _.filter(carts, (c) => c.leader.email_address !== currentUser.email_address);

    return (
      <div className='sidenav'>
        <div className='sidenav__overlay' onClick={_toggleSidenav}>
        </div>
        <ul className='sidenav__list'>
          <div className='sidenav__list__view'>
            <li className='sidenav__list__header'>
              <p>{currentUser.email_address}</p>
              <div className='icon' onClick={_toggleSidenav}>
                <Icon icon='Clear'/>
              </div>
            </li>
            <h4>Leader</h4>
            {_.map(leaderCarts, (c, i) => (
              <li key={i} className='sidenav__list__leader' onClick={_toggleSidenav}>
                <Link to={`/cart/${cart_id}/m/edit/${c.id}`}>
                  <div className='icon'>
                    <Icon icon='Edit'/>
                  </div>
                </Link>
                <Link to={`/cart/${c.id}`}>
                  <p>{c.name ? c.name : `${_.capitalize(getNameFromEmail(c.leader.email_address))}'s Cart (${c.items.length})`}</p>
                </Link>
              </li>
            ))}
            <h4>Member</h4>
            {_.map(memberCarts, (c, i) => (
              <li key={i} className='sidenav__list__leader' onClick={_toggleSidenav}>
                <div className='icon'>
                </div>
                <Link to={`/cart/${c.id}`}>
                  <p>{c.name ? c.name : `${_.capitalize(getNameFromEmail(c.leader.email_address))}'s Cart (${c.items.length})`}</p>
                </Link>
              </li>
            ))}
          </div>
          <div className='sidenav__list__actions'>
            <h4><Icon icon='Settings'/> Settings</h4>
            <h4><Icon icon='Email'/>Feedback</h4>
          </div>
          <footer>
            <Link to={`/cart/${cart_id}/m/share`} onClick={_toggleSidenav}>
              <button className='share'>
                <Icon icon='Person'/>
                <p>Add Others To Cart</p>
              </button>
            </Link>
            <a href='/newcart'>
              <button className='new'>
                <Icon icon='Plus'/>
                <p>New Cart</p>
              </button>
            </a>
          </footer>
        </ul>
      </div>
    );
  }
}
