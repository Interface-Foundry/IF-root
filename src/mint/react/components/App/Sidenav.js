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
    const { carts, _toggleSidenav, currentUser } = this.props,
      leaderCarts = _.filter(carts, (c) => c.leader.email_address === currentUser.email_address),
      memberCarts = _.filter(carts, (c) => c.leader.email_address !== currentUser.email_address);

    return (
      <div className='sidenav'>
        <div className='sidenav__overlay' onClick={_toggleSidenav}>
        </div>
        <ul className='sidenav__list'>
          <li className='sidenav__list__header'>
            <p>{currentUser.email_address}</p>
            <div className='icon' onClick={_toggleSidenav}>
              <Icon icon='Clear'/>
            </div>
          </li>
          <h4>Leader</h4>
          {_.map(leaderCarts, (c, i) => (
            <li key={i} className='sidenav__list__leader' onClick={_toggleSidenav}>
              <div className='icon'>
                <Icon icon='Edit'/>
              </div>
              <Link to={`/cart/${c.id}`}>
                <p>{`${_.capitalize(getNameFromEmail(c.leader.email_address))}'s Cart (${c.items.length})`}</p>
              </Link>
            </li>
          ))}
          <h4>Member</h4>
          {_.map(memberCarts, (c, i) => (
            <li key={i} className='sidenav__list__leader' onClick={_toggleSidenav}>
              <div className='icon'>
                <Icon icon='Edit'/>
              </div>
              <Link to={`/cart/${c.id}`}>
                <p>{`${_.capitalize(getNameFromEmail(c.leader.email_address))}'s Cart (${c.items.length})`}</p>
              </Link>
            </li>
          ))}
          <footer>
            <a href='/newcart'>
              <button>
                <p>New Cart</p>
              </button>
            </a>
          </footer>
        </ul>
      </div>
    );
  }
}
