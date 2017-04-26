// react/components/App/Sidenav.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
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

  state = {
    show: null
  }

  render() {
    const { carts, _toggleSidenav, currentUser, cart_id } = this.props, { show } = this.state,
      leaderCarts = _.filter(carts, (c, i) => c.leader.email_address === currentUser.email_address),
      memberCarts = _.filter(carts, (c, i) => c.leader.email_address !== currentUser.email_address);

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
          <div className='sidenav__list__view'>
            <h4>My Kip Carts</h4>
            {_.map(leaderCarts, (c, i) => {
              if(i > 1 && show !== 'me') return null;
              return ( 
                <li key={i} className='sidenav__list__leader' onClick={_toggleSidenav}>
                  { c.locked ? <div className='icon'/> : <Link to={`/cart/${cart_id}/m/edit/${c.id}`}>
                      <div className='icon'>
                        <Icon icon='Edit'/>
                      </div>
                    </Link>
                  }
                  <Link to={`/cart/${c.id}`}>
                    <p>
                      {c.name ? c.name : `${_.capitalize(getNameFromEmail(c.leader.email_address))}'s Cart (${c.items.length})`}
                      {c.locked ? <span>{moment(c.updatedAt).format('L')}</span> : null}
                    </p>
                  </Link>
                </li>
              )
            })}
            {
              leaderCarts.length > 2 ? <h4 className='show__more' onClick={() => show !== 'me' ? this.setState({show: 'me'}) : this.setState({show: null})}>
              <Icon icon={show === 'me' ? 'Up' : 'Down'}/>
                &nbsp; {show === 'me' ? 'Less' : 'More'}
              </h4> : null
            }
            <h4>Other Kip Carts</h4>
            {_.map(memberCarts, (c, i) => {
              if(i > 1 && show !== 'other') return null
              return (
                <li key={i} className='sidenav__list__leader' onClick={_toggleSidenav}>
                  <div className='icon'>
                  </div>
                  <Link to={`/cart/${c.id}`}>
                    <p>{c.name ? c.name : `${_.capitalize(getNameFromEmail(c.leader.email_address))}'s Cart (${c.items.length})`}</p>
                  </Link>
                </li>
              )
            })}
            {
              memberCarts.length > 2 ? <h4 className='show__more' onClick={() => show !== 'other' ? this.setState({show: 'other'}) : this.setState({show: null})}>
              <Icon icon={show === 'other' ? 'Up' : 'Down'}/>
                &nbsp; {show === 'other' ? 'Less' : 'More'}
              </h4> : null
            }
          </div>
          <div className='sidenav__list__actions'>
            <Link to={`/cart/${cart_id}/m/settings`} onClick={_toggleSidenav}><h4><Icon icon='Settings'/> Settings</h4></Link>
            <Link to={`/cart/${cart_id}/m/feedback`} onClick={_toggleSidenav}><h4><Icon icon='Email'/>Feedback</h4></Link>
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
