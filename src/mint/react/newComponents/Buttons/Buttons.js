// react/components/App/Buttons.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';

import Default from './Default';


export default class Buttons extends Component {
  render() {
    const { 
      user, 
      cart,
      _toggleLoginScreen,
      _toggleSidenav
    } = this.props;
    return (
      <nav className='buttons'>
        <Route path={'/cart/:cart_id'} exact component={() => 
              <Default {...this.props}/>
            }
        />
      </nav>
    );
  }
}
