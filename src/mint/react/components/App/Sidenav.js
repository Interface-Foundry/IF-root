// react/components/App/Sidenav.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { Icon } from '..';

export default class Sidenav extends Component {
  static propTypes = {
    cart_id: PropTypes.string,
    leader: PropTypes.object,
    carts: PropTypes.arrayOf(PropTypes.object),
    _toggleSidenav: PropTypes.func.isRequired,
    currentUser: PropTypes.object.isRequired,
    replace: PropTypes.func,
    itemsLen: PropTypes.number,
    updateCart: PropTypes.func,
    currentCart: PropTypes.object
  }

  state = {
    show: null
  }

  _handleShare = () => {
    const { replace, cart_id } = this.props;
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
      replace(`/cart/${cart_id}/m/share`);
    }
  }

  render() {
    const { carts, _toggleSidenav, currentUser, cart_id } = this.props, { show } = this.state,
      leaderCarts = _.filter(carts, (c, i) => c.leader.id === currentUser.id),
      memberCarts = _.filter(carts, (c, i) => c.leader.id !== currentUser.id);
    return (
      <div className='sidenav'>
        <div className='sidenav__overlay' onClick={_toggleSidenav}>
        </div>
        <ul className='sidenav__list'>
          <li className='sidenav__list__header'>
            <p>{currentUser.name ? currentUser.name : ''}</p>
            <div className='icon' onClick={_toggleSidenav}>
              <Icon icon='Clear'/>
            </div>
          </li>
          <li className='sidenav__list__view'>
            { leaderCarts.length ? <h4>My Kip Carts</h4> : null }
            <ul>
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
                        {c.name ? c.name : `${c.leader.name ? c.leader.name + '\'s ' : ''}Kip Cart`}
                        {c.locked ? <span><br/>{moment(c.updatedAt).format('L')}</span> : null}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {
              leaderCarts.length > 2 ? <h4 className='show__more' onClick={() => show !== 'me' ? this.setState({show: 'me'}) : this.setState({show: null})}>
              <Icon icon={show === 'me' ? 'Up' : 'Down'}/>
                &nbsp; {show === 'me' ? 'Less' : 'More'}
              </h4> : null
            }
            { memberCarts.length ? <h4>Other Kip Carts</h4> : null }
            <ul>
              {_.map(memberCarts, (c, i) => {
                if(i > 1 && show !== 'other') return null;
                return (
                  <li key={i} className='sidenav__list__leader' onClick={_toggleSidenav}>
                    <div className='icon'>
                    </div>
                    <Link to={`/cart/${c.id}`}>
                      <p>{c.name ? c.name : `${c.leader.name ? c.leader.name + '\'s ' : ''}Kip Cart`}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {
              memberCarts.length > 2 ? <h4 className='show__more' onClick={() => show !== 'other' ? this.setState({show: 'other'}) : this.setState({show: null})}>
              <Icon icon={show === 'other' ? 'Up' : 'Down'}/>
                &nbsp; {show === 'other' ? 'Less' : 'More'}
              </h4> : null
            }
          </li>
          <li className='sidenav__list__actions'>
            <Link to={`/cart/${cart_id}/m/settings`} onClick={_toggleSidenav}><h4><Icon icon='Settings'/> Settings</h4></Link>
            <Link to={`/cart/${cart_id}/m/feedback`} onClick={_toggleSidenav}><h4><Icon icon='Email'/>Feedback</h4></Link>
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
