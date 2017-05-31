// mint/react/components/App/App.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';

import { CartContainer, CartStoresContainer, LoginScreenContainer, SidenavContainer } from '../../containers';
import { Modal, ErrorPage } from '../../components';

import { Sidenav } from '../../../react-common/components';

//Analytics!
import ReactGA from 'react-ga';

export default class App extends Component {

  _logPageView(path, userId) {
    ReactGA.set({ userId });
    ReactGA.event({
      category: 'User',
      action: 'Initial Load'
    });
  }

  _handeKeyPress(e) {
    const { cart_id, history: { replace } } = this.props;
    if (e.keyCode === 27) replace(`/cart/${cart_id}`);
  }

  render() {
    const { sidenav, togglePopup, toggleSidenav } = this.props;
    return (
      <section className='app' onKeyDown={::this._handeKeyPress}>
        <div className='app__view'>
          {/* Render Error Page */}
          <Route path={'/404'} exact component={ErrorPage} />

          { /* Renders modal when route permits */ }
          <Route path={'/cart/:cart_id/m/*'} exact component={Modal} />

          { /* Renders cart when route permits */ }
          <Route path={'/cart/:cart_id'} exact component={CartContainer} />
          
        </div>
        { 
          sidenav 
          ? <Sidenav _toggleSidenav={toggleSidenav} /> 
          : null
        }
      </section>
    );
  }
}
