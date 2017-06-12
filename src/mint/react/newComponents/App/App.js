// mint/react/components/App/App.js

// NOTES: Try to keep any or all state/prop changes out of here otherwise it will bleed down all the way to the smallest component. 
// If change needed here please add the addition shouldComponentUpdate

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route, Switch } from 'react-router';

import { HeaderContainer, ViewContainer, LoginScreenContainer, SidenavContainer, StoresContainer } from '../../newContainers';
import { ErrorPage, Modal } from '..';

//Analytics!
import ReactGA from 'react-ga';

export default class App extends Component {

  _handeKeyPress(e) {
    // debugger
    console.log('key press: ', e)
  }

  _logPageView(path, userId) {
    ReactGA.set({ userId });
    ReactGA.event({
      category: 'User',
      action: 'Initial Load'
    });
  }

  componentWillReceiveProps(nextProps) {
    const { fetchCart, match } = this.props;

    if (nextProps.match.url.split('/')[2] !== match.url.split('/')[2])
      fetchCart(nextProps.match.url.split('/')[2])
  }

  shouldComponentUpdate(nextProps, nextState) {
    // need this, otherwise page always rerender every scroll
    if(
      nextProps.sidenav !== this.props.sidenav ||
      nextProps.popup !== this.props.popup ||
      nextProps.match.url !== this.props.match.url
    ) return true

    return false
  }

  render() {
    const { sidenav, popup, togglePopup, toggleSidenav } = this.props;
    return (
      <section className='app' onKeyDown={::this._handeKeyPress}>
        { popup ? <LoginScreenContainer _toggleLoginScreen={togglePopup}/> : null }
        <Route path={'/cart/:cart_id'} component={HeaderContainer} />
        <div className={`app__view ${sidenav ? 'squeeze' : ''}`}>
          <Route path={'/cart/:cart_id/m/*'} component={Modal} />

          <Route path={'/newcart'} exact component={StoresContainer} />
          <Route path={'/cart/:cart_id'} exact component={ViewContainer} />
          <Route path={'/404'} exact component={ErrorPage} />
        </div>
        { sidenav ? <SidenavContainer /> : null }  
      </section>
    );
  }
}
