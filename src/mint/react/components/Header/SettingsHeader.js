// react/components/Header/SettingsHeader.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../react-common/components';

export default class SettingsHeader extends Component {

  static propTypes = {
    match: PropTypes.object.isRequired,
    icon: PropTypes.string,
    text: PropTypes.string,
    user: PropTypes.object,
    cart: PropTypes.object,
    _toggleLoginScreen: PropTypes.func,
    _toggleSidenav: PropTypes.func
  }

  render() {
    const {
      icon,
      text,
      user,
      cart,
      _toggleLoginScreen,
      _toggleSidenav
    } = this.props;
    return (
      <span className='settings'>
        <div className='header__left'>
          <Link className='navbar__icon__close' to={`/cart/${cart.id}/`}>
            <Icon icon='Left'/>
          </Link>
          <h3 className='navbar__modal__head'>
            <Icon icon={icon}/>
            <span className='underline'>{text}</span>
          </h3>
        </div>
        <div className='header__right'>
          {!user.name ? <p onClick={() => _toggleLoginScreen()}><span>Login</span></p> : null}
          <div className='navbar__icon' onClick={_toggleSidenav}><Icon icon='Hamburger'/></div>
        </div>
      </span>
    );
  }
}
