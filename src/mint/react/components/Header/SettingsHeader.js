// react/components/Header/SettingsHeader.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
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
      history: { goBack }
    } = this.props;
    return (
      <span className='settings'>
          <a href='#' className='navbar__icon__close' onClick={(e)=> {e.preventDefault(); goBack();}}>
            <Icon icon='Left'/>
          </a>
          <div className={'image desktop'} style={{
              backgroundImage: 'url(//storage.googleapis.com/kip-random/website/logo_for_blue_bg.svg)'
          }}>
            <span className='beta'>beta</span>
          </div> 

      </span>
    );
  }
}
