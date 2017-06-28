// react/components/App/Header.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Icon, AlertBubble } from '../../../react-common/components';
import { SearchContainer } from '../../containers';

export default class Default extends Component {

  static propTypes = {
    user: PropTypes.object,
    cart: PropTypes.object,
    showAlert: PropTypes.bool,
    _toggleLoginScreen: PropTypes.func,
    _toggleSidenav: PropTypes.func
  }

  render() {
    const {
      user,
      cart,
      showAlert,
      _toggleLoginScreen,
      _toggleSidenav
    } = this.props;

    return (
      <span className='default'>
        <div className='header__left'>
          <Link to={`/cart/${cart.id}`}>
            <div className={'image'} style={{
              backgroundImage: 'url(//storage.googleapis.com/kip-random/website/logo_for_blue_bg.svg)'
            }}/>
          </Link>
          <SearchContainer />
        </div>
        <div className='header__right'>
          {!user.name ? <p onClick={() => _toggleLoginScreen()}><span>Login</span></p> : null}
          <div className='navbar__icon' onClick={_toggleSidenav}>
            <Icon icon='Hamburger'/>
            {showAlert ? <AlertBubble top={13} right={25} /> : null}
          </div>
        </div>
      </span>
    );
  }
}
