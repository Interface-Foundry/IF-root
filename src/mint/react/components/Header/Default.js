// react/components/App/Header.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../react-common/components';
import { SearchContainer } from '../../containers';

export default class Default extends Component {

  static propTypes = {
    match: PropTypes.object.isRequired,
    user: PropTypes.object,
    cart: PropTypes.object,
    _toggleLoginScreen: PropTypes.func,
    _toggleSidenav: PropTypes.func
  }

  render() {
    const {
      user,
      cart,
      _toggleLoginScreen,
      _toggleSidenav
    } = this.props;

    return (
      <span className='default'>
        <div className='header__left'>
          <Link to={`/cart/${cart.id}`}>
            <div className={'image'} style={{
              backgroundImage: `url(${cart.thumbnail_url ? cart.thumbnail_url : '//storage.googleapis.com/kip-random/kip_head_whitebg.png'})`
            }}/>
            <h3>
              Kip
            </h3>
          </Link>
          <SearchContainer />
        </div>
        <div className='header__right'>
          {!user.name ? <p onClick={() => _toggleLoginScreen()}><span>Login</span></p> : <p className='name'><Link to={`/cart/${cart.id}/m/settings`}><span>{user.name}</span></Link></p>}
          <div className='navbar__icon' onClick={_toggleSidenav}><Icon icon='Hamburger'/></div>
        </div>
      </span>
    );
  }
}
