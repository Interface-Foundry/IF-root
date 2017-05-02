// react/components/App/Sidenav.js

import React, { Component } from 'react';
import moment from 'moment';

import { Icon } from '../../themes';

const defaultRoute = 'localhost:3000'

export default class Sidenav extends Component {

  state = {
    show: null
  }

  render() {
    const { currentUser, _toggleSidenav, myCarts, otherCarts, get } = this.props, 
      { show } = this.state;

    return (
      <div className='sidenav'>
        <div className='sidenav__overlay' onClick={_toggleSidenav}>
        </div>
        <ul className='sidenav__list'>
          <li className='sidenav__list__header'>
            <p>{currentUser ? currentUser.email_address : 'Please Login'}</p>
            <div className='icon' onClick={_toggleSidenav}>
              <Icon icon='Clear'/>
            </div>
          </li>
          <div className='sidenav__list__view'>
            <h4>My Kip Carts</h4>
            {_.map(myCarts, (c, i) => {
              if(i > 1 && show !== 'me') return null;
              return ( 
                <li key={i} className='sidenav__list__leader' onClick={_toggleSidenav}>
                  <div className='icon'/>
                  <a href={`/cart/${c.id}`}>
                    <p>
                      {c.name ? c.name : `${_.capitalize(c.leader.email_address)}'s Cart (${c.items.length})`}
                      {c.locked ? <span>{moment(c.updatedAt).format('L')}</span> : null}
                    </p>
                  </a>
                </li>
              )
            })}
            {
              myCarts.length > 2 ? <h4 className='show__more' onClick={() => show !== 'me' ? this.setState({show: 'me'}) : this.setState({show: null})}>
              <Icon icon={show === 'me' ? 'Up' : 'Down'}/>
                &nbsp; {show === 'me' ? 'Less' : 'More'}
              </h4> : null
            }
            <h4>Other Kip Carts</h4>
            {_.map(otherCarts, (c, i) => {
              if(i > 1 && show !== 'other') return null
              return (
                <li key={i} className='sidenav__list__leader' onClick={_toggleSidenav}>
                  <div className='icon'/>
                  <a href={`/cart/${c.id}`}>
                    <p>{c.name ? c.name : `${_.capitalize(c.leader.email_address)}'s Cart (${c.items.length})`}</p>
                  </a>
                </li>
              )
            })}
            {
              otherCarts.length > 2 ? <h4 className='show__more' onClick={() => show !== 'other' ? this.setState({show: 'other'}) : this.setState({show: null})}>
              <Icon icon={show === 'other' ? 'Up' : 'Down'}/>
                &nbsp; {show === 'other' ? 'Less' : 'More'}
              </h4> : null
            }
          </div>
          <div className='sidenav__list__actions'>
            {currentUser ? <h4 onClick={() => {
              get('/api/logout', 'SESSION')
              location.reload();
            }}><Icon icon='Logout'/>Logout</h4> : null}
          </div>
          <footer>
            {currentUser ? <button className='hide' disabled={true}>
              <div className='icon'/>
              New Cart
            </button> : <a href='/newcart'>
              <button className='share'>
                <Icon icon='Login'/>
                Login
              </button>
            </a>}
            <a href='/newcart'>
              <button className='new'>
                <Icon icon='Plus'/>
                New Cart
              </button>
            </a>
          </footer>
        </ul>
      </div>
    );
  }
}
