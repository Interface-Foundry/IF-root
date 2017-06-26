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
    history: PropTypes.object,
    _toggleLoginScreen: PropTypes.func,
    _toggleSidenav: PropTypes.func
  }

  render() {
    const {
      icon,
      text,
      user,
      history: { goBack },
      _toggleLoginScreen,
      _toggleSidenav
    } = this.props;
    return (
      <span className='settings'>
        <div className='header__left'>
          <a href='#' className='navbar__icon__close' onClick={(e)=> {e.preventDefault(); goBack()}}>
            <Icon icon='Left'/>
          </a>
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
