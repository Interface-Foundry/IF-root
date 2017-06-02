// react/components/App/Header.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';
import { Link } from 'react-router-dom';
import { Icon } from '../../../react-common/components';
import { splitCartById } from '../../reducers';

export default class SettingsHeader extends Component {

  static propTypes = {
    match: PropTypes.object.isRequired,
  }

  render() {
    const { 
      icon,
      text,
      user, 
      cart,
      _toggleLoginScreen,
      _toggleSidenav,
      history: { push }
    } = this.props;

    return (
      <span className='settings'>
        <div className='navbar__modal settings'>
          <Link className='navbar__icon__close' to={`/cart/${cart.id}/`}>
            <Icon icon='Left'/>
          </Link>
          <h3 className='navbar__modal_head settings'>
            <Icon icon={icon}/>
            <span className='underline'>{text}</span>
          </h3>
          <div className='header__right'>
            {!user.name ? <p onClick={() => _toggleLoginScreen()}><span>Login</span></p> : <p><Link to={`/cart/${cart.id}/m/settings`}><span>{user.name}</span></Link></p>}
            <div className='navbar__icon' onClick={_toggleSidenav}><Icon icon='Hamburger'/></div>
          </div>
        </div>
      </span>
    );
  }
}